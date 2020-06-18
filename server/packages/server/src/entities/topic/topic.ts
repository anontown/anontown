import * as Im from "immutable";
import moment = require("moment-timezone");
import { AtPrerequisiteError, paramsErrorMaker } from "../../at-error";
import { IAuthToken } from "../../auth";
import { Config } from "../../config";
import { Constant } from "../../constant";
import { IObjectIdGenerator } from "../../ports";
import { hash } from "../../utils";
import { applyMixins } from "../../utils";
import { Copyable } from "../../utils";
import { History } from "../history";
import { Res, ResFork, ResHistory, ResTopic } from "../res";
import { User } from "../user";

export interface ITagsAPI {
  name: string;
  count: number;
}

export type ITopicAPI = ITopicOneAPI | ITopicNormalAPI | ITopicForkAPI;
export type ITopicSearchAPI = ITopicOneAPI | ITopicNormalAPI;

export interface ITopicBaseAPI<T extends TopicType> {
  readonly id: string;
  readonly title: string;
  readonly update: string;
  readonly date: string;
  readonly resCount: number;
  readonly type: T;
  readonly active: boolean;
}

export interface ITopicSearchBaseAPI<T extends TopicSearchType>
  extends ITopicBaseAPI<T> {
  readonly tags: Array<string>;
  readonly text: string;
}

export interface ITopicNormalAPI extends ITopicSearchBaseAPI<"normal"> {}

export interface ITopicOneAPI extends ITopicSearchBaseAPI<"one"> {}

export interface ITopicForkAPI extends ITopicBaseAPI<"fork"> {
  readonly parentID: string;
}

export type TopicSearchType = "one" | "normal";
export type TopicType = TopicSearchType | "fork";

export type Topic = TopicNormal | TopicOne | TopicFork;

export abstract class TopicBase<
  T extends TopicType,
  C extends TopicBase<T, C>
> {
  static checkData({
    title,
    tags,
    text,
  }: {
    title?: string;
    tags?: Array<string>;
    text?: string;
  }) {
    paramsErrorMaker([
      {
        field: "text",
        val: text,
        regex: Constant.topic.text.regex,
        message: Constant.topic.text.msg,
      },
      {
        field: "title",
        val: title,
        regex: Constant.topic.title.regex,
        message: Constant.topic.title.msg,
      },
      ...(tags !== undefined
        ? [
            () => {
              if (tags.length !== new Set(tags).size) {
                return {
                  field: "tags",
                  message: "タグの重複があります",
                };
              } else {
                return null;
              }
            },
            () => {
              if (tags.length > Constant.topic.tags.max) {
                return {
                  field: "tags",
                  message: Constant.topic.tags.msg,
                };
              } else {
                return null;
              }
            },
            ...tags.map((x, i) => ({
              field: `tags[${i}]`,
              val: x,
              regex: Constant.topic.tags.regex,
              message: Constant.topic.tags.msg,
            })),
          ]
        : []),
    ]);
  }

  abstract readonly id: string;
  abstract readonly title: string;
  abstract readonly update: Date;
  abstract readonly date: Date;
  abstract readonly resCount: number;
  abstract readonly type: T;
  abstract readonly ageUpdate: Date;
  abstract readonly active: boolean;

  abstract copy(partial: Partial<TopicBase<T, C>>): C;

  toBaseAPI(): ITopicBaseAPI<T> {
    return {
      id: this.id,
      title: this.title,
      update: this.update.toISOString(),
      date: this.date.toISOString(),
      resCount: this.resCount,
      type: this.type,
      active: this.active,
    };
  }

  resUpdate(res: Res): C {
    if (!this.active) {
      throw new AtPrerequisiteError("トピックが落ちているので書き込めません");
    }

    return this.copy({
      update: res.date,
      ageUpdate: res.type === "normal" && res.age ? res.date : this.ageUpdate,
    });
  }

  hash(date: Date, user: User): string {
    const mdate = moment(date).tz(Config.timezone);
    // TODO: テンプレートリテラル使うべきでは
    return hash(
      // ユーザー依存
      user.id +
        " " +
        // 書き込み年月日依存
        String(mdate.year()) +
        " " +
        String(mdate.month()) +
        " " +
        String(mdate.date()) +
        " " +
        // トピ依存
        this.id +
        // ソルト依存
        Config.salt.hash,
    ).substr(0, Constant.topic.hashLen);
  }
}

export abstract class TopicSearchBase<
  T extends TopicSearchType,
  C extends TopicSearchBase<T, C>
> extends TopicBase<T, C> {
  abstract readonly tags: Im.List<string>;
  abstract readonly text: string;

  toAPI(): ITopicSearchBaseAPI<T> {
    return {
      ...this.toBaseAPI(),
      tags: this.tags.toArray(),
      text: this.text,
    };
  }
}
applyMixins(TopicSearchBase, [TopicBase]);

export class TopicNormal extends Copyable<TopicNormal>
  implements TopicSearchBase<"normal", TopicNormal> {
  static create(
    objidGenerator: IObjectIdGenerator,
    title: string,
    tags: Array<string>,
    text: string,
    user: User,
    authToken: IAuthToken,
    now: Date,
  ) {
    TopicBase.checkData({ title, tags, text });
    const topic = new TopicNormal(
      objidGenerator.generateObjectId(),
      title,
      Im.List(tags),
      text,
      now,
      now,
      1,
      now,
      true,
    );
    const cd = topic.changeData(
      objidGenerator,
      user,
      authToken,
      title,
      tags,
      text,
      now,
    );
    const newUser = cd.user.changeLastTopic(now);

    return { topic: cd.topic, history: cd.history, res: cd.res, user: newUser };
  }

  readonly type: "normal" = "normal";

  toBaseAPI!: () => ITopicBaseAPI<"normal">;
  hash!: (date: Date, user: User) => string;
  toAPI!: () => ITopicSearchBaseAPI<"normal">;
  resUpdate!: (res: Res) => TopicNormal;

  constructor(
    readonly id: string,
    readonly title: string,
    readonly tags: Im.List<string>,
    readonly text: string,
    readonly update: Date,
    readonly date: Date,
    readonly resCount: number,
    readonly ageUpdate: Date,
    readonly active: boolean,
  ) {
    super(TopicNormal);
  }

  changeData(
    objidGenerator: IObjectIdGenerator,
    user: User,
    authToken: IAuthToken,
    title: string | undefined,
    tags: Array<string> | undefined,
    text: string | undefined,
    now: Date,
  ) {
    const newUser = user.usePoint(10);
    TopicBase.checkData({ title, tags, text });

    const newTopic = this.copy({
      title,
      tags: tags !== undefined ? Im.List(tags) : undefined,
      text,
    });

    const history = History.create(
      objidGenerator,
      newTopic.id,
      newTopic.title,
      newTopic.tags.toArray(),
      newTopic.text,
      now,
      newTopic.hash(now, newUser),
      newUser,
    );
    const { res, topic: newNewTopic } = ResHistory.create(
      objidGenerator,
      newTopic,
      newUser,
      authToken,
      history,
      now,
    );

    return { topic: newNewTopic, res, history, user: newUser };
  }
}
applyMixins(TopicNormal, [TopicSearchBase]);

export class TopicOne extends Copyable<TopicOne>
  implements TopicSearchBase<"one", TopicOne> {
  static create(
    objidGenerator: IObjectIdGenerator,
    title: string,
    tags: Array<string>,
    text: string,
    user: User,
    authToken: IAuthToken,
    now: Date,
  ) {
    TopicBase.checkData({ title, tags, text });
    const topic = new TopicOne(
      objidGenerator.generateObjectId(),
      title,
      Im.List(tags),
      text,
      now,
      now,
      1,
      now,
      true,
    );

    const { res, topic: newTopic } = ResTopic.create(
      objidGenerator,
      topic,
      user,
      authToken,
      now,
    );
    const newUser = user.changeLastOneTopic(now);

    return { topic: newTopic, res, user: newUser };
  }

  readonly type: "one" = "one";
  toBaseAPI!: () => ITopicBaseAPI<"one">;
  hash!: (date: Date, user: User) => string;
  toAPI!: () => ITopicSearchBaseAPI<"one">;
  resUpdate!: (res: Res) => TopicOne;

  constructor(
    readonly id: string,
    readonly title: string,
    readonly tags: Im.List<string>,
    readonly text: string,
    readonly update: Date,
    readonly date: Date,
    readonly resCount: number,
    readonly ageUpdate: Date,
    readonly active: boolean,
  ) {
    super(TopicOne);
  }
}
applyMixins(TopicOne, [TopicSearchBase]);

export class TopicFork extends Copyable<TopicFork>
  implements TopicBase<"fork", TopicFork> {
  static create(
    objidGenerator: IObjectIdGenerator,
    title: string,
    parent: TopicNormal,
    user: User,
    authToken: IAuthToken,
    now: Date,
  ) {
    TopicBase.checkData({ title });
    const topic = new TopicFork(
      objidGenerator.generateObjectId(),
      title,
      now,
      now,
      1,
      now,
      true,
      parent.id,
    );

    const { res, topic: newTopic } = ResTopic.create(
      objidGenerator,
      topic,
      user,
      authToken,
      now,
    );

    const { topic: newParent, res: resParent } = ResFork.create(
      objidGenerator,
      parent,
      user,
      authToken,
      newTopic,
      now,
    );
    const newUser = user.changeLastOneTopic(now);

    return {
      topic: newTopic,
      res,
      resParent,
      user: newUser,
      parent: newParent,
    };
  }

  readonly type: "fork" = "fork";
  toBaseAPI!: () => ITopicBaseAPI<"fork">;
  hash!: (date: Date, user: User) => string;
  resUpdate!: (res: Res) => TopicFork;

  constructor(
    readonly id: string,
    readonly title: string,
    readonly update: Date,
    readonly date: Date,
    readonly resCount: number,
    readonly ageUpdate: Date,
    readonly active: boolean,
    readonly parent: string,
  ) {
    super(TopicFork);
  }

  toAPI(): ITopicForkAPI {
    return {
      ...this.toBaseAPI(),
      parentID: this.parent,
    };
  }
}
applyMixins(TopicFork, [TopicBase]);
