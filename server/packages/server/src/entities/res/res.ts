import { option } from "fp-ts";
import { Option } from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/pipeable";
import * as Im from "immutable";
import {
  AtPrerequisiteError,
  AtRightError,
  paramsErrorMaker,
} from "../../at-error";
import { IAuthToken } from "../../auth";
import { Constant } from "../../constant";
import { IObjectIdGenerator } from "../../ports/index";
import { Copyable } from "../../utils";
import { applyMixins } from "../../utils";
import { History } from "../history";
import { Profile } from "../profile";
import { Topic, TopicFork, TopicNormal, TopicOne } from "../topic";
import { User } from "../user";

export interface IVote {
  readonly user: string;
  readonly value: number;
}

export type ResType = "normal" | "history" | "topic" | "fork";

export type ResAPIType = ResType | "delete";

/*
## 共通
  * self: 認証していなければnull。自分の書き込みかどうか
  * voteFlag: 認証していなければnull。投票状況
## normal
  * isReply: 認証していないもしくはリプ先がない時null。自分に対するリプライかどうか
## delete
  * normalかつdeleteFlagがactiveでない時
*/
export type IResAPI =
  | IResNormalAPI
  | IResHistoryAPI
  | IResTopicAPI
  | IResForkAPI
  | IResDeleteAPI;

export interface IResBaseAPI<T extends ResAPIType> {
  readonly id: string;
  readonly topicID: string;
  readonly date: Date;
  readonly self: boolean | null;
  readonly uv: number;
  readonly dv: number;
  readonly hash: string;
  readonly replyCount: number;
  readonly voteFlag: VoteFlag | null;
  readonly type: T;
}

export interface IResNormalAPI extends IResBaseAPI<"normal"> {
  readonly name: string | null;
  readonly text: string;
  readonly replyID: string | null;
  readonly profileID: string | null;
  readonly isReply: boolean | null;
}

export interface IResHistoryAPI extends IResBaseAPI<"history"> {
  readonly historyID: string;
}

export interface IResTopicAPI extends IResBaseAPI<"topic"> {}

export interface IResForkAPI extends IResBaseAPI<"fork"> {
  readonly forkID: string;
}

export interface IResDeleteAPI extends IResBaseAPI<"delete"> {
  readonly flag: "self" | "freeze";
}

export type VoteFlag = "uv" | "dv" | "not";
export type ResDeleteFlag = "active" | "self" | "freeze";
export interface IReply {
  readonly res: string;
  readonly user: string;
}

export abstract class ResBase<T extends ResType, C extends ResBase<T, C>> {
  abstract readonly id: string;
  abstract readonly topic: string;
  abstract readonly date: Date;
  abstract readonly user: string;
  abstract readonly votes: Im.List<IVote>;
  abstract readonly lv: number;
  abstract readonly hash: string;
  abstract readonly type: T;
  abstract readonly replyCount: number;

  abstract copy(partial: Partial<ResBase<T, C>>): C;

  // TODO: 名前をresetAndVoteに
  v(
    resUser: User,
    user: User,
    type: "uv" | "dv",
    _authToken: IAuthToken,
  ): { res: C; resUser: User } {
    const voted = this.votes.find(x => x.user === user.id);
    const data =
      voted !== undefined &&
      ((voted.value > 0 && type === "dv") || (voted.value < 0 && type === "uv"))
        ? this.cv(resUser, user, _authToken)
        : { res: this, resUser };
    return data.res._v(data.resUser, user, type, _authToken);
  }

  // TODO: 名前をvoteに
  _v(
    resUser: User,
    user: User,
    type: "uv" | "dv",
    _authToken: IAuthToken,
  ): { res: C; resUser: User } {
    if (user.id === this.user) {
      throw new AtRightError("自分に投票は出来ません");
    }
    if (this.votes.find(x => x.user === user.id) !== undefined) {
      throw new AtPrerequisiteError("既に投票しています");
    }
    const valueAbs = Math.floor(user.lv / 100) + 1;
    const value = type === "uv" ? valueAbs : -valueAbs;
    const newResUser = resUser.changeLv(resUser.lv + value);
    return {
      res: this.copy({
        votes: this.votes.push({ user: user.id, value }),
      }),
      resUser: newResUser,
    };
  }

  cv(
    resUser: User,
    user: User,
    _authToken: IAuthToken,
  ): { res: C; resUser: User } {
    const vote = this.votes.find(x => x.user === user.id);
    if (vote === undefined) {
      throw new AtPrerequisiteError("投票していません");
    }
    const newResUser = resUser.changeLv(resUser.lv - vote.value);
    return {
      res: this.copy({
        votes: this.votes.remove(this.votes.indexOf(vote)),
      }),
      resUser: newResUser,
    };
  }

  toBaseAPI(authToken: Option<IAuthToken>): IResBaseAPI<T> {
    const voteFlag = pipe(
      authToken,
      option.map(authToken => {
        const vote = this.votes.find(v => authToken.user === v.user);
        if (vote === undefined) {
          return "not";
        } else {
          return vote.value > 0 ? "uv" : "dv";
        }
      }),
      option.toNullable,
    );

    return {
      id: this.id,
      topicID: this.topic,
      date: this.date,
      self: pipe(
        authToken,
        option.map(authToken => authToken.user === this.user),
        option.toNullable,
      ),
      uv: this.votes.filter(x => x.value > 0).size,
      dv: this.votes.filter(x => x.value < 0).size,
      hash: this.hash,
      replyCount: this.replyCount,
      voteFlag,
      type: this.type,
    };
  }
}

export type Res = ResNormal | ResHistory | ResTopic | ResFork;

export class ResNormal extends Copyable<ResNormal>
  implements ResBase<"normal", ResNormal> {
  static create(
    objidGenerator: IObjectIdGenerator,
    topic: Topic,
    user: User,
    _authToken: IAuthToken,
    name: Option<string>,
    text: string,
    reply: Option<Res>,
    profile: Option<Profile>,
    age: boolean,
    now: Date,
  ) {
    paramsErrorMaker([
      {
        field: "text",
        val: text,
        regex: Constant.res.text.regex,
        message: Constant.res.text.msg,
      },
      {
        field: "name",
        val: name,
        regex: Constant.res.name.regex,
        message: Constant.res.name.msg,
      },
    ]);

    if (
      pipe(
        profile,
        option.map(profile => profile.user !== user.id),
        option.getOrElse(() => false),
      )
    ) {
      throw new AtRightError("自分のプロフィールを指定して下さい。");
    }

    // もしリプ先があるかつ、トピックがリプ先と違えばエラー
    if (
      pipe(
        reply,
        option.map(reply => reply.topic !== topic.id),
        option.getOrElse(() => false),
      )
    ) {
      throw new AtPrerequisiteError("他のトピックのレスへのリプは出来ません");
    }

    const newUser = user.changeLastRes(now);

    const result = new ResNormal(
      name,
      text,
      pipe(
        reply,
        option.map(reply => ({ res: reply.id, user: reply.user })),
      ),
      "active",
      pipe(
        profile,
        option.map(profile => profile.id),
      ),
      age,
      objidGenerator.generateObjectId(),
      topic.id,
      now,
      newUser.id,
      Im.List(),
      newUser.lv * 5,
      topic.hash(now, newUser),
      0,
    );

    const newTopic = topic.resUpdate(result);
    return { res: result, user: newUser, topic: newTopic };
  }

  readonly type: "normal" = "normal";

  toBaseAPI!: (authToken: Option<IAuthToken>) => IResBaseAPI<"normal">;
  cv!: (
    resUser: User,
    user: User,
    _authToken: IAuthToken,
  ) => { res: ResNormal; resUser: User };
  _v!: (
    resUser: User,
    user: User,
    type: "uv" | "dv",
    _authToken: IAuthToken,
  ) => { res: ResNormal; resUser: User };
  v!: (
    resUser: User,
    user: User,
    type: "uv" | "dv",
    _authToken: IAuthToken,
  ) => { res: ResNormal; resUser: User };

  constructor(
    readonly name: Option<string>,
    readonly text: string,
    readonly reply: Option<IReply>,
    readonly deleteFlag: ResDeleteFlag,
    readonly profile: Option<string>,
    readonly age: boolean,
    readonly id: string,
    readonly topic: string,
    readonly date: Date,
    readonly user: string,
    readonly votes: Im.List<IVote>,
    readonly lv: number,
    readonly hash: string,
    readonly replyCount: number,
  ) {
    super(ResNormal);
  }

  toAPI(authToken: Option<IAuthToken>): IResNormalAPI | IResDeleteAPI {
    if (this.deleteFlag === "active") {
      return {
        ...this.toBaseAPI(authToken),
        name: pipe(this.name, option.toNullable),
        text: this.text,
        replyID: pipe(
          this.reply,
          option.map(x => x.res),
          option.toNullable,
        ),
        profileID: pipe(this.profile, option.toNullable),
        isReply: pipe(
          authToken,
          option.chain(authToken =>
            pipe(
              this.reply,
              option.map(reply => authToken.user === reply.user),
            ),
          ),
          option.toNullable,
        ),
      };
    } else {
      return {
        ...this.toBaseAPI(authToken),
        type: "delete",
        flag: this.deleteFlag,
      };
    }
  }

  del(resUser: User, authToken: IAuthToken) {
    if (authToken.user !== this.user) {
      throw new AtRightError("人の書き込み削除は出来ません");
    }

    if (this.deleteFlag !== "active") {
      throw new AtPrerequisiteError("既に削除済みです");
    }

    const newResUser = resUser.changeLv(resUser.lv - 1);
    return {
      res: this.copy({
        deleteFlag: "self",
      }),
      resUser: newResUser,
    };
  }
}
applyMixins(ResNormal, [ResBase]);

export class ResHistory extends Copyable<ResHistory>
  implements ResBase<"history", ResHistory> {
  static create(
    objidGenerator: IObjectIdGenerator,
    topic: TopicNormal,
    user: User,
    _authToken: IAuthToken,
    history: History,
    now: Date,
  ) {
    const result = new ResHistory(
      history.id,
      objidGenerator.generateObjectId(),
      topic.id,
      now,
      user.id,
      Im.List(),
      user.lv * 5,
      topic.hash(now, user),
      0,
    );

    const newTopic = topic.resUpdate(result);
    return { res: result, topic: newTopic };
  }

  toBaseAPI!: (authToken: Option<IAuthToken>) => IResBaseAPI<"history">;
  cv!: (
    resUser: User,
    user: User,
    _authToken: IAuthToken,
  ) => { res: ResHistory; resUser: User };
  _v!: (
    resUser: User,
    user: User,
    type: "uv" | "dv",
    _authToken: IAuthToken,
  ) => { res: ResHistory; resUser: User };
  v!: (
    resUser: User,
    user: User,
    type: "uv" | "dv",
    _authToken: IAuthToken,
  ) => { res: ResHistory; resUser: User };

  readonly type: "history" = "history";

  constructor(
    readonly history: string,
    readonly id: string,
    readonly topic: string,
    readonly date: Date,
    readonly user: string,
    readonly votes: Im.List<IVote>,
    readonly lv: number,
    readonly hash: string,
    readonly replyCount: number,
  ) {
    super(ResHistory);
  }

  toAPI(authToken: Option<IAuthToken>): IResHistoryAPI {
    return {
      ...this.toBaseAPI(authToken),
      historyID: this.history,
    };
  }
}
applyMixins(ResHistory, [ResBase]);

export class ResTopic extends Copyable<ResTopic>
  implements ResBase<"topic", ResTopic> {
  static create<TC extends TopicOne | TopicFork>(
    objidGenerator: IObjectIdGenerator,
    topic: TC,
    user: User,
    _authToken: IAuthToken,
    now: Date,
  ) {
    const result = new ResTopic(
      objidGenerator.generateObjectId(),
      topic.id,
      now,
      user.id,
      Im.List(),
      user.lv * 5,
      topic.hash(now, user),
      0,
    );

    // TODO:キャストなしで書きたい
    const newTopic = topic.resUpdate(result) as TC;
    return { res: result, topic: newTopic };
  }

  toBaseAPI!: (authToken: Option<IAuthToken>) => IResBaseAPI<"topic">;
  cv!: (
    resUser: User,
    user: User,
    _authToken: IAuthToken,
  ) => { res: ResTopic; resUser: User };
  _v!: (
    resUser: User,
    user: User,
    type: "uv" | "dv",
    _authToken: IAuthToken,
  ) => { res: ResTopic; resUser: User };
  v!: (
    resUser: User,
    user: User,
    type: "uv" | "dv",
    _authToken: IAuthToken,
  ) => { res: ResTopic; resUser: User };

  readonly type: "topic" = "topic";

  constructor(
    readonly id: string,
    readonly topic: string,
    readonly date: Date,
    readonly user: string,
    readonly votes: Im.List<IVote>,
    readonly lv: number,
    readonly hash: string,
    readonly replyCount: number,
  ) {
    super(ResTopic);
  }

  toAPI(authToken: Option<IAuthToken>): IResTopicAPI {
    return this.toBaseAPI(authToken);
  }
}
applyMixins(ResTopic, [ResBase]);

export class ResFork extends Copyable<ResFork>
  implements ResBase<"fork", ResFork> {
  static create(
    objidGenerator: IObjectIdGenerator,
    topic: TopicNormal,
    user: User,
    _authToken: IAuthToken,
    fork: TopicFork,
    now: Date,
  ) {
    const result = new ResFork(
      fork.id,
      objidGenerator.generateObjectId(),
      topic.id,
      now,
      user.id,
      Im.List(),
      user.lv * 5,
      topic.hash(now, user),
      0,
    );

    const newTopic = topic.resUpdate(result);
    return { res: result, topic: newTopic };
  }

  toBaseAPI!: (authToken: Option<IAuthToken>) => IResBaseAPI<"fork">;
  cv!: (
    resUser: User,
    user: User,
    _authToken: IAuthToken,
  ) => { res: ResFork; resUser: User };
  _v!: (
    resUser: User,
    user: User,
    type: "uv" | "dv",
    _authToken: IAuthToken,
  ) => { res: ResFork; resUser: User };
  v!: (
    resUser: User,
    user: User,
    type: "uv" | "dv",
    _authToken: IAuthToken,
  ) => { res: ResFork; resUser: User };

  readonly type: "fork" = "fork";

  constructor(
    readonly fork: string,
    readonly id: string,
    readonly topic: string,
    readonly date: Date,
    readonly user: string,
    readonly votes: Im.List<IVote>,
    readonly lv: number,
    readonly hash: string,
    readonly replyCount: number,
  ) {
    super(ResFork);
  }

  toAPI(authToken: Option<IAuthToken>): IResForkAPI {
    return {
      ...this.toBaseAPI(authToken),
      forkID: this.fork,
    };
  }
}
applyMixins(ResFork, [ResBase]);
