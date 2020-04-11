import { isNullish } from "@kgtkr/utils";
import { AtNotFoundError } from "../../at-error";
import { Topic } from "../../entities";
import * as G from "../../generated/graphql";
import { IResRepo, ITopicRepo } from "../../ports";
import {
  fromTopic,
  ITopicDB,
  ITopicForkDB,
  ITopicOneDB,
  toTopic,
} from "./itopic-db";

export class TopicRepoMock implements ITopicRepo {
  private topics: Array<ITopicDB> = [];

  constructor(public resRepo: IResRepo) {}

  async findOne(id: string): Promise<Topic> {
    const topic = this.topics.find(x => x.id === id);

    if (topic === undefined) {
      throw new AtNotFoundError("トピックが存在しません");
    }

    return (await this.aggregate([topic]))[0];
  }

  async findTags(
    limit: number,
  ): Promise<Array<{ name: string; count: number }>> {
    return Array.from(
      this.topics
        .map(x => (x.body.type !== "fork" ? x.body.tags : []))
        .reduce((a, b) => a.concat(...b), [])
        .reduce(
          (a, b) => a.set(b, (a.get(b) || 0) + 1),
          new Map<string, number>(),
        ),
    )
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  }

  async find(
    query: G.TopicQuery,
    skip: number,
    limit: number,
  ): Promise<Array<Topic>> {
    const titles = !isNullish(query.title)
      ? query.title.split(/\s/).filter(x => x.length !== 0)
      : null;

    return this.aggregate(
      this.topics
        .filter(x => isNullish(query.id) || query.id.includes(x.id))
        .filter(
          x => titles === null || titles.every(t => x.body.title.includes(t)),
        )
        .filter(
          x =>
            isNullish(query.tags) ||
            query.tags.every(t => "tags" in x.body && x.body.tags.includes(t)),
        )
        .filter(x => !query.activeOnly || x.body.active)
        .filter(
          x =>
            isNullish(query.parent) ||
            ("parent" in x.body && x.body.parent === query.parent),
        )
        .sort(
          (a, b) =>
            new Date(b.body.ageUpdate).valueOf() -
            new Date(a.body.ageUpdate).valueOf(),
        )
        .slice(skip)
        .slice(0, limit),
    );
  }

  async cronTopicCheck(now: Date): Promise<void> {
    this.topics
      .filter<ITopicForkDB | ITopicOneDB>(
        (x): x is ITopicForkDB | ITopicOneDB =>
          x.body.type === "fork" || x.body.type === "one",
      )
      .filter(
        x =>
          new Date(x.body.update).valueOf() <
          new Date(now.valueOf() - 1000 * 60 * 60 * 24 * 7).valueOf(),
      )
      .map(x => ({ ...x, body: { ...x.body, active: false } }))
      .forEach(x => {
        this.topics[this.topics.findIndex(y => y.id === x.id)] = x;
      });
  }

  async insert(topic: Topic): Promise<void> {
    this.topics.push(fromTopic(topic));
  }

  async update(topic: Topic): Promise<void> {
    this.topics[this.topics.findIndex(x => x.id === topic.id)] = fromTopic(
      topic,
    );
  }

  private async aggregate(topics: Array<ITopicDB>): Promise<Array<Topic>> {
    const count = await this.resRepo.resCount(topics.map(x => x.id));

    return topics.map(t => toTopic(t, count.get(t.id) || 0));
  }
}
