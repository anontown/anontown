import { isNullish } from "@kgtkr/utils";
import { AtNotFoundError } from "../../at-error";
import { History } from "../../entities";
import * as G from "../../generated/graphql";
import { IHistoryRepo } from "../../ports";
import { PrismaTransactionClient } from "../../prisma-client";
import * as P from "@prisma/client";
import * as Im from "immutable";

export function ToEntity(h: P.History): History {
  return new History(
    h.id,
    h.topicId,
    h.title,
    Im.List(h.tags),
    h.description,
    h.createdAt,
    h.hash,
    h.userId,
  );
}

export function fromEntity(
  history: History,
): Omit<P.Prisma.HistoryCreateInput, "id"> {
  return {
    topicId: history.topic,
    title: history.title,
    tags: history.tags.toArray(),
    description: history.text,
    createdAt: history.date,
    hash: history.hash,
    userId: history.user,
  };
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
  }

  async update(history: History): Promise<void> {
    const model = fromEntity(history);

    await this.prisma.history.update({
      where: { id: history.id },
      data: model,
    });
  }

  async findOne(id: string): Promise<History> {
    const history = await this.prisma.history.findUnique({ where: { id } });
    if (history === null) {
      throw new AtNotFoundError("編集履歴が存在しません");
    }

    return ToEntity(history);
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
      take: limit,
    });

    const result = histories.map(h => ToEntity(h));
    if (
      !isNullish(query.date) &&
      (query.date.type === "gt" || query.date.type === "gte")
    ) {
      result.reverse();
    }
    return result;
  }
}
