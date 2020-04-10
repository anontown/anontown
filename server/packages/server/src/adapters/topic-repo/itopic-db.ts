import * as Im from "immutable";
import {
  Topic,
  TopicBase,
  TopicFork,
  TopicNormal,
  TopicOne,
  TopicSearchBase,
  TopicSearchType,
  TopicType,
} from "../../entities";

export interface ITopicDB {
  id: string;
  body: ITopicNormalDB["body"] | ITopicOneDB["body"] | ITopicForkDB["body"];
}

export interface ITopicBaseDB<T extends TopicType, Body> {
  readonly id: string;
  readonly body: {
    readonly type: T;
    readonly title: string;
    readonly update: string;
    readonly date: string;
    readonly ageUpdate: string;
    readonly active: boolean;
  } & Body;
}

export type ITopicSearchBaseDB<T extends TopicSearchType> = ITopicBaseDB<
  T,
  {
    readonly tags: Array<string>;
    readonly text: string;
  }
>;

export type ITopicNormalDB = ITopicSearchBaseDB<"normal">;

export type ITopicOneDB = ITopicSearchBaseDB<"one">;

export type ITopicForkDB = ITopicBaseDB<
  "fork",
  {
    readonly parent: string;
  }
>;

export function fromTopicBase<T extends TopicType>() {
  return <C extends TopicBase<T, C>, Body extends object>(
    topic: C,
    body: Body,
  ): ITopicBaseDB<T, Body> => ({
    id: topic.id,
    body: Object.assign({}, body, {
      type: topic.type,
      title: topic.title,
      update: topic.update.toISOString(),
      date: topic.date.toISOString(),
      ageUpdate: topic.ageUpdate.toISOString(),
      active: topic.active,
    }),
  });
}

export function fromTopicSearchBase<
  T extends TopicSearchType,
  C extends TopicSearchBase<T, C>
>(topic: C): ITopicSearchBaseDB<T> {
  return fromTopicBase<T>()(topic, {
    tags: topic.tags.toArray(),
    text: topic.text,
  });
}

export function toTopicNormal(
  db: ITopicNormalDB,
  resCount: number,
): TopicNormal {
  return new TopicNormal(
    db.id,
    db.body.title,
    Im.List(db.body.tags),
    db.body.text,
    new Date(db.body.update),
    new Date(db.body.date),
    resCount,
    new Date(db.body.ageUpdate),
    db.body.active,
  );
}

export function fromTopicNormal(topic: TopicNormal): ITopicNormalDB {
  return fromTopicSearchBase(topic);
}

export function toTopicOne(db: ITopicOneDB, resCount: number): TopicOne {
  return new TopicOne(
    db.id,
    db.body.title,
    Im.List(db.body.tags),
    db.body.text,
    new Date(db.body.update),
    new Date(db.body.date),
    resCount,
    new Date(db.body.ageUpdate),
    db.body.active,
  );
}

export function fromTopicOne(topic: TopicOne): ITopicOneDB {
  return fromTopicSearchBase(topic);
}

export function toTopicFork(db: ITopicForkDB, resCount: number): TopicFork {
  return new TopicFork(
    db.id,
    db.body.title,
    new Date(db.body.update),
    new Date(db.body.date),
    resCount,
    new Date(db.body.ageUpdate),
    db.body.active,
    db.body.parent,
  );
}

export function fromTopicFork(topic: TopicFork): ITopicForkDB {
  return fromTopicBase<"fork">()(topic, { parent: topic.parent });
}

export function fromTopic(topic: Topic): ITopicDB {
  switch (topic.type) {
    case "normal":
      return fromTopicNormal(topic);
    case "one":
      return fromTopicOne(topic);
    case "fork":
      return fromTopicFork(topic);
  }
}

export function toTopic(topic: ITopicDB, resCount: number): Topic {
  switch (topic.body.type) {
    case "normal":
      return toTopicNormal({ ...topic, body: topic.body }, resCount);
    case "one":
      return toTopicOne({ ...topic, body: topic.body }, resCount);
    case "fork":
      return toTopicFork({ ...topic, body: topic.body }, resCount);
  }
}
