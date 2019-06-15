import { isNullish } from "@kgtkr/utils";
import { CronJob } from "cron";
import { AtNotFoundError } from "../../at-error";
import { ESClient } from "../../db";
import * as G from "../../generated/graphql";
import { IResRepo } from "../res";
import { ITopicRepo } from "./itopic-repo";
import {
  ITopicDB,
  Topic,
  TopicFork,
  TopicNormal,
  TopicOne,
} from "./topic";

export interface ITagsAPI {
  name: string;
  count: number;
}

export class TopicRepo implements ITopicRepo {
  constructor(public resRepo: IResRepo, private refresh?: boolean) { }

  async findOne(id: string): Promise<Topic> {
    let topic;
    try {
      topic = await ESClient().get<ITopicDB["body"]>({
        index: "topics",
        type: "doc",
        id,
      });
    } catch {
      throw new AtNotFoundError("トピックが存在しません");
    }
    return (await this.aggregate([{ id: topic._id, body: topic._source } as ITopicDB]))[0];
  }

  async findTags(limit: number): Promise<ITagsAPI[]> {
    if (limit === 0) {
      return [];
    }

    const data = await ESClient().search({
      index: "topics",
      size: 0,
      body: {
        aggs: {
          tags_count: {
            terms: {
              field: "tags",
              size: limit,
            },
          },
        },
      },
    });

    const tags: { key: string, doc_count: number }[] = data.aggregations.tags_count.buckets;

    return tags.map(x => ({ name: x.key, count: x.doc_count }));
  }

  async find(
    query: G.TopicQuery,
    skip: number,
    limit: number): Promise<Topic[]> {
    const filter: any[] = [];
    if (!isNullish(query.id)) {
      filter.push({
        terms: {
          _id: query.id,
        },
      });
    }

    if (!isNullish(query.title)) {
      filter.push({
        match: {
          title: {
            query: query.title,
            operator: "and",
            zero_terms_query: "all",
          },
        },
      });
    }

    if (!isNullish(query.tags)) {
      filter.push(...query.tags.map(t => ({
        term: {
          tags: t,
        },
      })));
    }

    if (query.activeOnly) {
      filter.push({
        term: { active: true },
      });
    }

    if (!isNullish(query.parent)) {
      filter.push({
        match: {
          parent: query.parent,
        },
      });
    }

    const topics = await ESClient().search<ITopicDB["body"]>({
      index: "topics",
      size: limit,
      from: skip,
      body: {
        query: {
          bool: {
            filter,
          },
        },
        sort: { ageUpdate: { order: "desc" } },
      },
    });

    return this.aggregate(topics.hits.hits.map(x => ({ id: x._id, body: x._source })));
  }

  async cronTopicCheck(now: Date): Promise<void> {
    await ESClient().updateByQuery({
      index: "topics",
      type: "doc",
      body: {
        script: {
          inline: "ctx._source.active = false",
        },
        query: {
          bool: {
            filter: [
              {
                range: {
                  update: {
                    lt: new Date(now.valueOf() - 1000 * 60 * 60 * 24 * 7).toISOString(),
                  },
                },
              },
              {
                terms: {
                  type: ["one", "fork"],
                },
              },
            ],
          },
        },
      },
      refresh: this.refresh,
    });
  }

  cron() {
    // 毎時間トピ落ちチェック
    new CronJob({
      cronTime: "00 00 * * * *",
      onTick: async () => {
        await this.cronTopicCheck(new Date());
      },
      start: false,
      timeZone: "Asia/Tokyo",
    }).start();
  }

  async insert(topic: Topic): Promise<void> {
    const tDB = topic.toDB();
    await ESClient().create({
      index: "topics",
      type: "doc",
      id: tDB.id,
      body: tDB.body,
      refresh: this.refresh,
    });
  }

  async update(topic: Topic): Promise<void> {
    const tDB = topic.toDB();
    await ESClient().index({
      index: "topics",
      type: "doc",
      id: tDB.id,
      body: tDB.body,
      refresh: this.refresh !== undefined ? this.refresh.toString() as "true" | "false" : undefined,
    });
  }

  private async aggregate(topics: ITopicDB[]): Promise<Topic[]> {
    const count = await this.resRepo.resCount(topics.map(x => x.id));

    return topics.map(x => {
      const c = count.get(x.id) || 0;
      switch (x.body.type) {
        case "normal":
          return TopicNormal.fromDB({ id: x.id, body: x.body }, c);
        case "one":
          return TopicOne.fromDB({ id: x.id, body: x.body }, c);
        case "fork":
          return TopicFork.fromDB({ id: x.id, body: x.body }, c);
      }
    });

  }
}
