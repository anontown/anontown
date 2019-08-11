import { ObjectID } from "mongodb";
import { IResWait, User } from "../../entities";

export interface IUserDB {
  readonly _id: ObjectID;
  readonly sn: string;
  readonly pass: string;
  readonly lv: number;
  readonly resWait: IResWait;
  readonly lastTopic: Date;
  readonly date: Date;
  readonly point: number;
  readonly lastOneTopic: Date;
}

export function toUser(u: IUserDB): User {
  return new User(
    u._id.toString(),
    u.sn,
    u.pass,
    u.lv,
    u.resWait,
    u.lastTopic,
    u.date,
    u.point,
    u.lastOneTopic,
  );
}

export function fromUser(user: User): IUserDB {
  return {
    _id: new ObjectID(user.id),
    sn: user.sn,
    pass: user.pass,
    lv: user.lv,
    resWait: user.resWait,
    lastTopic: user.lastTopic,
    date: user.date,
    point: user.point,
    lastOneTopic: user.lastOneTopic,
  };
}
