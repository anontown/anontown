import { fromNullable } from "fp-ts/lib/Option";
import * as Im from "immutable";
import {
  IReply,
  IVote,
  Res,
  ResAPIType,
  ResBase,
  ResDeleteFlag,
  ResFork,
  ResHistory,
  ResNormal,
  ResTopic,
  ResType,
} from "../../entities";

export interface IResDB {
  id: string;
  body:
    | IResNormalDB["body"]
    | IResHistoryDB["body"]
    | IResTopicDB["body"]
    | IResForkDB["body"];
}

export interface IResBaseDB<T extends ResType, Body> {
  readonly id: string;
  readonly body: {
    readonly type: T;
    readonly topic: string;
    readonly date: string;
    readonly user: string;
    readonly votes: IVote[];
    readonly lv: number;
    readonly hash: string;
  } & Body;
}

export type IResNormalDB = IResBaseDB<
  "normal",
  {
    readonly name: string | null;
    readonly text: string;
    readonly reply: IReply | null;
    readonly deleteFlag: ResDeleteFlag;
    readonly profile: string | null;
    readonly age: boolean;
  }
>;

export type IResHistoryDB = IResBaseDB<
  "history",
  {
    history: string;
  }
>;

export type IResTopicDB = IResBaseDB<"topic", {}>;

export type IResForkDB = IResBaseDB<
  "fork",
  {
    fork: string;
  }
>;

export function toResNormal(db: IResNormalDB, replyCount: number): ResNormal {
  return new ResNormal(
    fromNullable(db.body.name),
    db.body.text,
    fromNullable(db.body.reply),
    db.body.deleteFlag,
    fromNullable(db.body.profile),
    db.body.age,
    db.id,
    db.body.topic,
    new Date(db.body.date),
    db.body.user,
    Im.List(db.body.votes),
    db.body.lv,
    db.body.hash,
    replyCount,
  );
}

export function toResHistory(
  db: IResHistoryDB,
  replyCount: number,
): ResHistory {
  return new ResHistory(
    db.body.history,
    db.id,
    db.body.topic,
    new Date(db.body.date),
    db.body.user,
    Im.List(db.body.votes),
    db.body.lv,
    db.body.hash,
    replyCount,
  );
}

export function toResTopic(db: IResTopicDB, replyCount: number): ResTopic {
  return new ResTopic(
    db.id,
    db.body.topic,
    new Date(db.body.date),
    db.body.user,
    Im.List(db.body.votes),
    db.body.lv,
    db.body.hash,
    replyCount,
  );
}

export function toResFork(db: IResForkDB, replyCount: number): ResFork {
  return new ResFork(
    db.body.fork,
    db.id,
    db.body.topic,
    new Date(db.body.date),
    db.body.user,
    Im.List(db.body.votes),
    db.body.lv,
    db.body.hash,
    replyCount,
  );
}

export function toRes(db: IResDB, replyCount: number): Res {
  switch (db.body.type) {
    case "normal":
      return toResNormal({ ...db, body: db.body }, replyCount);
    case "history":
      return toResHistory({ ...db, body: db.body }, replyCount);
    case "topic":
      return toResTopic({ ...db, body: db.body }, replyCount);
    case "fork":
      return toResFork({ ...db, body: db.body }, replyCount);
  }
}

export function fromResBase<T extends ResType>() {
  return <C extends ResBase<T, C>, Body extends object>(
    res: C,
    body: Body,
  ): IResBaseDB<T, Body> => ({
    id: res.id,
    body: Object.assign({}, body, {
      type: res.type,
      topic: res.topic,
      date: res.date.toISOString(),
      user: res.user,
      votes: res.votes.toArray(),
      lv: res.lv,
      hash: res.hash,
    }),
  });
}
export function fromResNormal(res: ResNormal): IResNormalDB {
  return fromResBase<"normal">()(res, {
    name: res.name.toNullable(),
    text: res.text,
    reply: res.reply.toNullable(),
    deleteFlag: res.deleteFlag,
    profile: res.profile.toNullable(),
    age: res.age,
  });
}

export function fromResHistory(res: ResHistory): IResHistoryDB {
  return fromResBase<"history">()(res, { history: res.history });
}

export function fromResTopic(res: ResTopic): IResTopicDB {
  return fromResBase<"topic">()(res, {});
}

export function fromResFork(res: ResFork): IResForkDB {
  return fromResBase<"fork">()(res, { fork: res.fork });
}

export function fromRes(res: Res): IResDB {
  switch (res.type) {
    case "normal":
      return fromResNormal(res);
    case "history":
      return fromResHistory(res);
    case "topic":
      return fromResTopic(res);
    case "fork":
      return fromResFork(res);
  }
}
