import { isNullish } from "@kgtkr/utils";
import { AtNotFoundError } from "../../at-error";
import { History } from "../../entities";
import * as G from "../../generated/graphql";
import { IHistoryRepo } from "../../ports";
import { PrismaTransactionClient } from "../../prisma-client";
import * as P from "@prisma/client";
import * as Im from "immutable";
import { pipe } from "fp-ts/lib/pipeable";
import * as A from "fp-ts/lib/Array";
import * as Ord from "fp-ts/lib/Ord";

function toEntity(
  h: P.History & {
    tags: Array<P.HistoryTag>;
  },
): History {
  return new History(
    h.id,
    h.topicId,
    h.title,
    pipe(
      h.tags,
      A.sort(Ord.contramap<number, P.HistoryTag>(x => x.order)(Ord.ordNumber)),
      A.map(({ tag }) => tag),
      xs => Im.List(xs),
    ),
    h.description,
    h.createdAt,
    h.hash,
    h.userId,
  );
}

function fromEntity(history: History): Omit<P.Prisma.HistoryCreateInput, "id"> {
  return {
    topicId: history.topic,
    title: history.title,
    description: history.text,
    createdAt: history.date,
    hash: history.hash,
    userId: history.user,
  };
}

function tagsFromEntity(
  history: History,
): Array<P.Prisma.HistoryTagCreateManyInput> {
  return history.tags
    .toArray()
    .map<P.Prisma.HistoryTagCreateManyInput>((tag, i) => ({
      historyId: history.id,
      order: i,
      tag: tag,
    }));
}

export class HistoryRepo implements IHistoryRepo {
  constructor(private prisma: PrismaTransactionClient) {}

  async insert(history: History): Promise<void> {
    const model = fromEntity(history);
    await this.prisma.history.create({
      data: {
        ...model,
        id: history.id,
      },
    });

    await this.prisma.historyTag.createMany({
      data: tagsFromEntity(history),
    });
  }

  async update(history: History): Promise<void> {
    const model = fromEntity(history);

    await this.prisma.history.update({
      where: { id: history.id },
      data: model,
    });
    await this.prisma.historyTag.deleteMany({
      where: { historyId: history.id },
    });
    await this.prisma.historyTag.createMany({
      data: tagsFromEntity(history),
    });
  }

  async findOne(id: string): Promise<History> {
    const history = await this.prisma.history.findUnique({
      where: { id },
      include: { tags: true },
    });
    if (history === null) {
      throw new AtNotFoundError("編集履歴が存在しません");
    }

    return toEntity(history);
  }

  async find(query: G.HistoryQuery, limit: number): Promise<Array<History>> {
    const filter: Array<P.Prisma.HistoryWhereInput> = [];
    if (!isNullish(query.id)) {
      filter.push({
        id: {
          in: query.id,
        },
      });
    }

    if (!isNullish(query.date)) {
      filter.push({
        createdAt: {
          [query.date.type]: query.date.date,
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

    const histories = await this.prisma.history.findMany({
      where: { AND: filter },
      orderBy: {
        createdAt:
          !isNullish(query.date) &&
          (query.date.type === "gt" || query.date.type === "gte")
            ? "asc"
            : "desc",
      },
      include: { tags: true },
      take: limit,
    });

    const result = histories.map(h => toEntity(h));
    if (
      !isNullish(query.date) &&
      (query.date.type === "gt" || query.date.type === "gte")
    ) {
      result.reverse();
    }
    return result;
  }
}
