import { isNullish } from "@kgtkr/utils";
import { AtNotFoundError } from "../../at-error";
import { IAuthToken } from "../../auth";
import { Msg } from "../../entities";
import * as G from "../../generated/graphql";
import { IMsgRepo } from "../../ports";
import * as P from "@prisma/client";
import * as O from "fp-ts/lib/Option";
import { PrismaTransactionClient } from "../../prisma-client";

export function toMsg(m: P.Msg): Msg {
  return new Msg(
    m.id,
    O.fromNullable(m.receiverId),
    m.content,
    new Date(m.createdAt),
  );
}

export function fromMsg(msg: Msg): Omit<P.Prisma.MsgCreateInput, "id"> {
  return {
    receiverId: O.toNullable(msg.receiver),
    content: msg.text,
    createdAt: msg.date.toISOString(),
  };
}

export class MsgRepo implements IMsgRepo {
  constructor(private prisma: PrismaTransactionClient) {}

  async findOne(id: string): Promise<Msg> {
    const msg = await this.prisma.msg.findUnique({ where: { id } });
    if (msg === null) {
      throw new AtNotFoundError("メッセージが存在しません");
    }

    return toMsg(msg);
  }

  async find(
    authToken: IAuthToken,
    query: G.MsgQuery,
    limit: number,
  ): Promise<Array<Msg>> {
    const filter: Array<P.Prisma.MsgWhereInput> = [
      {
        OR: [
          {
            receiverId: null,
          },
          {
            receiverId: authToken.user,
          },
        ],
      },
    ];
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
    const msgs = await this.prisma.msg.findMany({
      where: { AND: filter },
      orderBy: {
        createdAt:
          !isNullish(query.date) &&
          (query.date.type === "gt" || query.date.type === "gte")
            ? "asc"
            : "desc",
      },
      take: limit,
    });

    const result = msgs.map(m => toMsg(m));
    if (
      !isNullish(query.date) &&
      (query.date.type === "gt" || query.date.type === "gte")
    ) {
      result.reverse();
    }
    return result;
  }

  async insert(msg: Msg): Promise<void> {
    const mDB = fromMsg(msg);
    await this.prisma.msg.create({
      data: { ...mDB, id: msg.id },
    });
  }

  async update(msg: Msg): Promise<void> {
    const mDB = fromMsg(msg);
    await this.prisma.msg.update({
      where: { id: msg.id },
      data: mDB,
    });
  }
}
