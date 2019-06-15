import { isNullish } from "@kgtkr/utils";
import { Subject } from "rxjs";
import { AtNotFoundError } from "../../at-error";
import { createRedisClient, ESClient, RedisClient } from "../../db";
import * as G from "../../generated/graphql";
import { AuthContainer } from "../../server/auth-container";
import { IResRepo } from "./ires-repo";
import { fromDBToRes, IResDB, Res, ResNormal } from "./res";

interface ResPubSub {
  res: IResDB;
  count: number;
  replyCount: number;
}

export class ResRepo implements IResRepo {
  readonly insertEvent: Subject<{ res: Res, count: number }> = new Subject<{ res: Res, count: number }>();
  private subRedis = createRedisClient();

  constructor(private refresh?: boolean) {
    this.subRedis.subscribe("res/add");
    this.subRedis.on("message", (_channel, message) => {
      const data: ResPubSub = JSON.parse(message);
      this.insertEvent.next({ res: fromDBToRes(data.res, data.replyCount), count: data.count });
    });
  }

  async findOne(id: string): Promise<Res> {
    let res;
    try {
      res = await ESClient().get<IResDB["body"]>({
        index: "reses",
        type: "doc",
        id,
      });
    } catch {
      throw new AtNotFoundError("レスが存在しません");
    }
    return (await this.aggregate([{ id: res._id, body: res._source }]))[0];
  }

  async insert(res: Res): Promise<void> {
    const rDB = res.toDB();
    await ESClient().create({
      index: "reses",
      type: "doc",
      id: rDB.id,
      body: rDB.body,
      refresh: true,
    });
    // TODO:refresh:trueじゃなくても動くようにしたいけどとりあえず

    const resCount = (await this.resCount([res.topic])).get(res.topic) || 0;
    const data: ResPubSub = {
      res: res.toDB(),
      replyCount: res.replyCount,
      count: resCount,
    };
    await RedisClient.publish("res/add", JSON.stringify(data));
  }

  async update(res: Res): Promise<void> {
    const rDB = res.toDB();
    await ESClient().index({
      index: "reses",
      type: "doc",
      id: rDB.id,
      body: rDB.body,
      refresh: this.refresh !== undefined ? this.refresh.toString() as "true" | "false" : undefined,
    });
  }

  async resCount(topicIDs: string[]): Promise<Map<string, number>> {
    if (topicIDs.length === 0) {
      return new Map();
    }

    const data = await ESClient().search({
      index: "reses",
      size: 0,
      body: {
        query: {
          terms: {
            topic: topicIDs,
          },
        },
        aggs: {
          res_count: {
            terms: {
              field: "topic",
              size: topicIDs.length,
            },
          },
        },
      },
    });

    const countArr: { key: string, doc_count: number }[] = data.aggregations.res_count.buckets;
    return new Map(countArr.map<[string, number]>(x => [x.key, x.doc_count]));
  }

  async replyCount(resIDs: string[]): Promise<Map<string, number>> {
    if (resIDs.length === 0) {
      return new Map();
    }
    const data = await ESClient().search({
      index: "reses",
      size: 0,
      body: {
        query: {
          nested: {
            path: "reply",
            query: {
              terms: {
                "reply.res": resIDs,
              },
            },
          },
        },
        aggs: {
          reply_count: {
            nested: {
              path: "reply",
            },
            aggs: {
              reply_count: {
                terms: {
                  field: "reply.res",
                  size: resIDs.length,
                },
              },
            },
          },
        },
      },
    });

    const countArr: { key: string, doc_count: number }[] = data.aggregations.reply_count.reply_count.buckets;
    return new Map(countArr.map<[string, number]>(x => [x.key, x.doc_count]));
  }

  async find(
    auth: AuthContainer,
    query: G.ResQuery,
    limit: number): Promise<Res[]> {
    const filter: object[] = [];

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

    if (!isNullish(query.topic)) {
      filter.push({
        term: {
          topic: query.topic,
        },
      });
    }

    if (query.notice) {
      filter.push({
        nested: {
          path: "reply",
          query: {
            term: {
              "reply.user": auth.token.user,
            },
          },
        },
      });
    }

    if (!isNullish(query.hash)) {
      filter.push({
        term: {
          hash: query.hash,
        },
      });
    }

    if (!isNullish(query.reply)) {
      filter.push({
        nested: {
          path: "reply",
          query: {
            term: {
              "reply.res": query.reply,
            },
          },
        },
      });
    }

    if (!isNullish(query.profile)) {
      filter.push({
        term: {
          profile: query.profile,
        },
      });
    }

    if (query.self) {
      filter.push({
        term: {
          user: auth.token.user,
        },
      });
    }

    if (!isNullish(query.text)) {
      filter.push({
        match: {
          text: {
            query: query.text,
            operator: "and",
            zero_terms_query: "all",
          },
        },
      });
    }

    const reses = await ESClient().search<IResDB["body"]>({
      index: "reses",
      size: limit,
      body: {
        query: {
          bool: {
            filter,
          },
        },
        sort: {
          date: {
            order: !isNullish(query.date) && (query.date.type === "gt" || query.date.type === "gte")
              ? "asc"
              : "desc",
          },
        },
      },
    });

    const result = await this.aggregate(reses.hits.hits.map(r => ({ id: r._id, body: r._source })));
    if (!isNullish(query.date) && (query.date.type === "gt" || query.date.type === "gte")) {
      result.reverse();
    }
    return result;
  }

  private async aggregate(reses: IResDB[]): Promise<Res[]> {
    const count = await this.replyCount(reses.map(x => x.id));
    return reses.map(r => fromDBToRes(r, count.get(r.id) || 0));
  }
}
