import { Option } from "fp-ts/lib/Option";
import * as Im from "immutable";
import { IAuthToken } from "../../auth";
import { IGenerator } from "../../generator";
import { Copyable } from "../../utils";
import { TopicNormal } from "../topic";
import { User } from "../user";
import { option } from "fp-ts";
import { pipe } from "fp-ts/lib/pipeable";

export interface IHistoryAPI {
  readonly id: string;
  readonly topicID: string;
  readonly title: string;
  readonly tags: string[];
  readonly text: string;
  readonly date: string;
  readonly hash: string;
  readonly self: boolean | null;
}

export class History extends Copyable<History> {
  static create(
    objidGenerator: IGenerator<string>,
    topic: TopicNormal,
    date: Date,
    hash: string,
    user: User,
  ): History {
    return new History(
      objidGenerator(),
      topic.id,
      topic.title,
      Im.List(topic.tags),
      topic.text,
      date,
      hash,
      user.id,
    );
  }

  constructor(
    readonly id: string,
    readonly topic: string,
    readonly title: string,
    readonly tags: Im.List<string>,
    readonly text: string,
    readonly date: Date,
    readonly hash: string,
    readonly user: string,
  ) {
    super(History);
  }

  toAPI(authToken: Option<IAuthToken>): IHistoryAPI {
    return {
      id: this.id,
      topicID: this.topic,
      title: this.title,
      tags: this.tags.toArray(),
      text: this.text,
      date: this.date.toISOString(),
      hash: this.hash,
      self: pipe(
        authToken,
        option.map(authToken => authToken.user === this.user),
        option.toNullable,
      ),
    };
  }
}
