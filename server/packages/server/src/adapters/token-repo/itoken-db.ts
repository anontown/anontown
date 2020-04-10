import * as Im from "immutable";
import { ObjectID } from "mongodb";
import {
  ITokenReq,
  Token,
  TokenBase,
  TokenGeneral,
  TokenMaster,
  TokenType,
} from "../../entities";

export type ITokenDB = ITokenGeneralDB | ITokenMasterDB;

export interface ITokenBaseDB<T extends TokenType> {
  readonly _id: ObjectID;
  readonly key: string;
  readonly type: T;
  readonly user: ObjectID;
  readonly date: Date;
}

export interface ITokenMasterDB extends ITokenBaseDB<"master"> {}

export interface ITokenGeneralDB extends ITokenBaseDB<"general"> {
  readonly client: ObjectID;
  readonly req: Array<ITokenReq>;
}

export function fromTokenBase<T extends TokenType>() {
  return <C extends TokenBase<T, C>>(tokenBase: C): ITokenBaseDB<T> => ({
    _id: new ObjectID(tokenBase.id),
    key: tokenBase.key,
    user: new ObjectID(tokenBase.user),
    date: tokenBase.date,
    type: tokenBase.type,
  });
}

export function toTokenMaster(t: ITokenMasterDB): TokenMaster {
  return new TokenMaster(t._id.toString(), t.key, t.user.toString(), t.date);
}

export function fromTokenMaster(token: TokenMaster): ITokenMasterDB {
  return fromTokenBase<"master">()(token);
}

export function toTokenGeneral(t: ITokenGeneralDB): TokenGeneral {
  return new TokenGeneral(
    t._id.toString(),
    t.key,
    t.client.toString(),
    t.user.toString(),
    Im.List(t.req),
    t.date,
  );
}

export function fromTokenGeneral(token: TokenGeneral): ITokenGeneralDB {
  return {
    ...fromTokenBase<"general">()(token),
    client: new ObjectID(token.client),
    req: token.req.toArray(),
  };
}

export function toToken(token: ITokenDB): Token {
  switch (token.type) {
    case "general":
      return toTokenGeneral(token);
    case "master":
      return toTokenMaster(token);
  }
}

export function fromToken(token: Token): ITokenDB {
  switch (token.type) {
    case "general":
      return fromTokenGeneral(token);
    case "master":
      return fromTokenMaster(token);
  }
}
