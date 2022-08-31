import { isNullish, nullUnwrap } from "@kgtkr/utils";
import { Observable } from "rxjs";
import { AtNotFoundError } from "../../at-error";
import { createRedisClient, RedisClient } from "../../db";
import { Res, ResNormal, ResHistory, ResFork, ResTopic } from "../../entities";
import * as G from "../../generated/graphql";
import { IAuthContainer, IResRepo } from "../../ports";
import { z } from "zod";
import * as P from "@prisma/client";
import { PrismaTransactionClient } from "../../prisma-client";
import * as O from "fp-ts/lib/Option";
import * as Im from "immutable";
import { pipe } from "fp-ts/lib/pipeable";
import * as A from "fp-ts/lib/Array";
import * as Ord from "fp-ts/lib/Ord";

const ResPubSub = z.object({
  id: z.string(),
});

type ResPubSub = z.infer<typeof ResPubSub>;
const ResPubSubChannel = "res/add";

function toEntity(
  model: P.Res & {
    votes: Array<P.ResVote>;
    reply: P.Res | null;
    _count: {
      replieds: number;
    } | null;
  },
): Res {
  const votes = pipe(
    model.votes,
    A.sort(Ord.contramap<number, P.ResVote>(x => x.order)(Ord.ordNumber)),
    A.map(v => ({ user: v.userId, value: v.vote })),
    xs => Im.List(xs),
  );
  switch (model.type) {
    case "NORMAL":
      return new ResNormal(
        O.fromNullable(model.name),
        nullUnwrap(model.content),
        pipe(
          O.fromNullable(model.reply),
          O.map(replyRes => ({
            res: replyRes.id,
            user: replyRes.userId,
          })),
        ),
        (() => {
          const deleteFlag = nullUnwrap(model.deleteFlag);
          switch (deleteFlag) {
            case "ACTIVE":
              return "active" as const;
            case "SELF":
              return "self" as const;
            case "FREEZE":
              return "freeze" as const;
          }
        })(),
        O.fromNullable(model.profileId),
        nullUnwrap(model.age),
        model.id,
        model.topicId,
        model.createdAt,
        model.userId,
        votes,
        model.lv,
        model.hash,
        model._count?.replieds ?? 0,
      );
    case "HISTORY":
      return new ResHistory(
        nullUnwrap(model.historyId),
        model.id,
        model.topicId,
        model.createdAt,
        model.userId,
        votes,
        model.lv,
        model.hash,
        model._count?.replieds ?? 0,
      );
    case "TOPIC":
      return new ResTopic(
        model.id,
        model.topicId,
        model.createdAt,
        model.userId,
        votes,
        model.lv,
        model.hash,
        model._count?.replieds ?? 0,
      );
    case "FORK":
      return new ResFork(
        nullUnwrap(model.forkId),
        model.id,
        model.topicId,
        model.createdAt,
        model.userId,
        votes,
        model.lv,
        model.hash,
        model._count?.replieds ?? 0,
      );
  }
}

function fromEntity(entity: Res): Omit<P.Prisma.ResUncheckedCreateInput, "id"> {
  const resBase: Omit<P.Prisma.ResUncheckedCreateInput, "id" | "type"> = {
    createdAt: entity.date,
    userId: entity.user,
    lv: entity.lv,
    hash: entity.hash,
    topicId: entity.topic,
  };

  switch (entity.type) {
    case "normal":
      return {
        ...resBase,
        type: "NORMAL",
        name: pipe(entity.name, O.toNullable),
        content: entity.text,
        replyId: pipe(
          entity.reply,
          O.map(reply => reply.res),
          O.toNullable,
        ),
        deleteFlag: (() => {
          switch (entity.deleteFlag) {
            case "active":
              return "ACTIVE" as const;
            case "self":
              return "SELF" as const;
            case "freeze":
              return "FREEZE" as const;
          }
        })(),
        profileId: pipe(entity.profile, O.toNullable),
        age: entity.age,
      };
    case "history":
      return {
        ...resBase,
        type: "HISTORY",
        historyId: entity.history,
      };
    case "topic":
      return {
        ...resBase,
        type: "TOPIC",
      };
    case "fork":
      return {
        ...resBase,
        type: "FORK",
        forkId: entity.fork,
      };
  }
}

function votesFromEntity(res: Res): Array<P.Prisma.ResVoteCreateManyInput> {
  return res.votes.toArray().map((vote, i) => ({
    resId: res.id,
    userId: vote.user,
    vote: vote.value,
    order: i,
  }));
}

export class ResRepo implements IResRepo {
  constructor(private prisma: PrismaTransactionClient) {}

  subscribeInsertEvent(): Observable<{ res: Res; count: number }> {
    return new Observable<{ res: Res; count: number }>(subscriber => {
      const subRedis = createRedisClient();
      subRedis.subscribe(ResPubSubChannel);
      subRedis.on("message", (_channel: any, message: string) => {
        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        (async () => {
          const unknownData: unknown = JSON.parse(message);
          try {
            const data = ResPubSub.parse(unknownData);
            const res = await this.findOne(data.id);
            const count = await this.prisma.res.count({
              where: { topicId: res.topic },
            });
            subscriber.next({
              res: res,
              count: count,
            });
          } catch (e) {
            console.error(e);
          }
        })();
      });
      return () => {
        subRedis.disconnect();
      };
    });
  }

  async findOne(id: string): Promise<Res> {
    const res = await this.prisma.res.findUnique({
      where: {
        id,
      },
      include: {
        votes: true,
        reply: true,
        _count: {
          select: {
            replieds: true,
          },
        },
      },
    });
    if (res === null) {
      throw new AtNotFoundError("レスが存在しません");
    }
    return toEntity(res);
  }

  async insert(res: Res): Promise<void> {
    const model = fromEntity(res);
    await this.prisma.res.create({
      data: {
        ...model,
        id: res.id,
      },
    });
    await this.prisma.resVote.createMany({
      data: votesFromEntity(res),
    });

    const data: ResPubSub = {
      id: res.id,
    };
    await RedisClient().publish(ResPubSubChannel, JSON.stringify(data));
  }

  async update(res: Res): Promise<void> {
    const model = fromEntity(res);

    await this.prisma.res.update({
      where: { id: res.id },
      data: model,
    });
    await this.prisma.resVote.deleteMany({
      where: {
        resId: res.id,
      },
    });
    await this.prisma.resVote.createMany({
      data: votesFromEntity(res),
    });
  }

  async find(
    auth: IAuthContainer,
    query: G.ResQuery,
    limit: number,
  ): Promise<Array<Res>> {
    const filter: Array<P.Prisma.ResWhereInput> = [];

    if (!isNullish(query.date)) {
      filter.push({
        createdAt: {
          [query.date.type]: query.date.date,
        },
      });
    }

    if (!isNullish(query.id)) {
      filter.push({
        id: {
          in: query.id,
        },
      });
    }

    if (!isNullish(query.topic)) {
      filter.push({
        topicId: {
          in: query.topic,
        },
      });
    }

    if (query.notice) {
      filter.push({
        reply: {
          userId: auth.getToken().user,
        },
      });
    }

    if (!isNullish(query.hash)) {
      filter.push({
        hash: query.hash,
      });
    }

    if (!isNullish(query.reply)) {
      filter.push({
        replyId: query.reply,
      });
    }

    if (!isNullish(query.profile)) {
      filter.push({
        profileId: query.profile,
      });
    }

    if (query.self) {
      filter.push({
        userId: auth.getToken().user,
      });
    }

    if (!isNullish(query.text)) {
      for (const text of query.text.split(/\s/).filter(x => x.length !== 0)) {
        filter.push({
          content: {
            contains: text,
            mode: "insensitive",
          },
        });
      }
    }

    const reses = await this.prisma.res.findMany({
      where: { AND: filter },
      orderBy: {
        createdAt:
          !isNullish(query.date) &&
          (query.date.type === "gt" || query.date.type === "gte")
            ? "asc"
            : "desc",
      },
      include: {
        votes: true,
        reply: true,
        _count: {
          select: {
            replieds: true,
          },
        },
      },
      take: limit,
    });

    const result = reses.map(h => toEntity(h));
    if (
      !isNullish(query.date) &&
      (query.date.type === "gt" || query.date.type === "gte")
    ) {
      result.reverse();
    }
    return result;
  }
}
