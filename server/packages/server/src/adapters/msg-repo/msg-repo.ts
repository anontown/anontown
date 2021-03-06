import { isNullish } from "@kgtkr/utils";
import { AtNotFoundError } from "../../at-error";
import { IAuthToken } from "../../auth";
import { ESClient } from "../../db";
import { Msg } from "../../entities";
import * as G from "../../generated/graphql";
import { IMsgRepo } from "../../ports";
import { fromMsg, IMsgDB, toMsg } from "./imsg-db";

export class MsgRepo implements IMsgRepo {
  constructor(private refresh?: boolean) {}

  async findOne(id: string): Promise<Msg> {
    let msg;
    try {
      msg = await ESClient().get<IMsgDB["body"]>({
        index: "msgs",
        type: "doc",
        id,
      });
    } catch {
      throw new AtNotFoundError("メッセージが存在しません");
    }

    return toMsg({ id: msg._id, body: msg._source });
  }

  async find(
    authToken: IAuthToken,
    query: G.MsgQuery,
    limit: number,
  ): Promise<Array<Msg>> {
    const filter: Array<any> = [
      {
        bool: {
          should: [
            {
              bool: {
                must_not: {
                  exists: {
                    field: "receiver",
                  },
                },
              },
            },
            { term: { receiver: authToken.user } },
          ],
        },
      },
    ];
    if (!isNullish(query.date)) {
      filter.push({
        range: {
          date: {
            [query.date.type]: query.date.date,
          },
        },
      });
    }
    if (!isNullish(query.id)) {
      filter.push({
        terms: {
          _id: query.id,
        },
      });
    }
    const msgs = await ESClient().search<IMsgDB["body"]>({
      index: "msgs",
      size: limit,
      body: {
        query: {
          bool: {
            filter,
          },
        },
        sort: {
          date: {
            order:
              !isNullish(query.date) &&
              (query.date.type === "gt" || query.date.type === "gte")
                ? "asc"
                : "desc",
          },
        },
      },
    });

    const result = msgs.hits.hits.map(m =>
      toMsg({ id: m._id, body: m._source }),
    );
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
    await ESClient().create({
      index: "msgs",
      type: "doc",
      id: mDB.id,
      body: mDB.body,
      refresh: this.refresh,
    });
  }

  async update(msg: Msg): Promise<void> {
    const mDB = fromMsg(msg);
    await ESClient().index({
      index: "msgs",
      type: "doc",
      id: mDB.id,
      body: mDB.body,
      refresh:
        this.refresh !== undefined
          ? (this.refresh.toString() as "true" | "false")
          : undefined,
    });
  }
}
