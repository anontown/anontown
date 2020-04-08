import * as Im from "immutable";
import { AtNotFoundError, AtTokenAuthError } from "../../at-error";
import { IAuthTokenGeneral, IAuthTokenMaster, IAuthUser } from "../../auth";
import { Config } from "../../config";
import { Constant } from "../../constant";
import { IObjectIdGenerator, ISafeIdGenerator } from "../../ports";
import { Copyable } from "../../utils";
import { hash } from "../../utils";
import { applyMixins } from "../../utils";
import { Client } from "../client";

export interface ITokenReq {
  readonly key: string;
  readonly expireDate: Date;
  readonly active: boolean;
}

export interface ITokenReqAPI {
  readonly token: string;
  readonly key: string;
}

export type TokenType = "master" | "general";

export type ITokenAPI = ITokenGeneralAPI | ITokenMasterAPI;

export interface ITokenBaseAPI<T extends TokenType> {
  readonly id: string;
  readonly key: string;
  readonly date: string;
  readonly type: T;
}

export interface ITokenMasterAPI extends ITokenBaseAPI<"master"> {}

export interface ITokenGeneralAPI extends ITokenBaseAPI<"general"> {
  readonly clientID: string;
}

export type Token = TokenMaster | TokenGeneral;

export abstract class TokenBase<
  T extends TokenType,
  C extends TokenBase<T, C>
> {
  static createTokenKey(randomGenerator: ISafeIdGenerator): string {
    return hash(randomGenerator.generateSafeId() + Config.salt.token);
  }

  abstract readonly id: string;
  abstract readonly key: string;
  abstract readonly user: string;
  abstract readonly date: Date;
  abstract readonly type: T;

  abstract copy(partial: Partial<TokenBase<T, C>>): C;

  toBaseAPI(): ITokenBaseAPI<T> {
    return {
      id: this.id,
      key: this.key,
      date: this.date.toISOString(),
      type: this.type,
    };
  }
}

export class TokenMaster extends Copyable<TokenMaster>
  implements TokenBase<"master", TokenMaster> {
  static create(
    objidGenerator: IObjectIdGenerator,
    authUser: IAuthUser,
    now: Date,
    randomGenerator: ISafeIdGenerator,
  ): TokenMaster {
    return new TokenMaster(
      objidGenerator.generateObjectId(),
      TokenBase.createTokenKey(randomGenerator),
      authUser.id,
      now,
    );
  }

  readonly type: "master" = "master";

  toBaseAPI!: () => ITokenBaseAPI<"master">;

  constructor(
    readonly id: string,
    readonly key: string,
    readonly user: string,
    readonly date: Date,
  ) {
    super(TokenMaster);
  }

  toAPI(): ITokenMasterAPI {
    return this.toBaseAPI();
  }

  auth(key: string): IAuthTokenMaster {
    if (this.key !== key) {
      throw new AtTokenAuthError();
    }

    return { id: this.id, key: this.key, user: this.user, type: this.type };
  }
}
applyMixins(TokenMaster, [TokenBase]);

export class TokenGeneral extends Copyable<TokenGeneral>
  implements TokenBase<"general", TokenGeneral> {
  static create(
    objidGenerator: IObjectIdGenerator,
    authToken: IAuthTokenMaster,
    client: Client,
    now: Date,
    randomGenerator: ISafeIdGenerator,
  ): TokenGeneral {
    return new TokenGeneral(
      objidGenerator.generateObjectId(),
      TokenBase.createTokenKey(randomGenerator),
      client.id,
      authToken.user,
      Im.List(),
      now,
    );
  }

  readonly type: "general" = "general";

  toBaseAPI!: () => ITokenBaseAPI<"general">;

  constructor(
    readonly id: string,
    readonly key: string,
    readonly client: string,
    readonly user: string,
    readonly req: Im.List<ITokenReq>,
    readonly date: Date,
  ) {
    super(TokenGeneral);
  }

  toAPI(): ITokenGeneralAPI {
    return {
      ...this.toBaseAPI(),
      clientID: this.client,
    };
  }

  createReq(
    now: Date,
    randomGenerator: ISafeIdGenerator,
  ): { token: TokenGeneral; req: ITokenReqAPI } {
    const nowNum = now.getTime();

    // ゴミを削除
    const reqFilter = this.req.filter(
      r => r.active && nowNum < r.expireDate.getTime(),
    );

    const req: ITokenReq = {
      key: TokenBase.createTokenKey(randomGenerator),
      expireDate: new Date(
        nowNum + 1000 * 60 * Constant.token.req.expireMinute,
      ),
      active: true,
    };

    return {
      token: this.copy({
        req: reqFilter.push(req),
      }),
      req: {
        token: this.id,
        key: req.key,
      },
    };
  }

  authReq(key: string, now: Date): IAuthTokenGeneral {
    // TODO: 自動削除
    const req = this.req.find(x => x.key === key);
    if (
      req === undefined ||
      !req.active ||
      req.expireDate.getTime() < now.getTime()
    ) {
      throw new AtNotFoundError("トークンリクエストが見つかりません");
    }

    return {
      id: this.id,
      key: this.key,
      user: this.user,
      type: "general",
      client: this.client,
    };
  }

  auth(key: string): IAuthTokenGeneral {
    if (this.key !== key) {
      throw new AtTokenAuthError();
    }

    return {
      id: this.id,
      key: this.key,
      user: this.user,
      type: this.type,
      client: this.client,
    };
  }
}
applyMixins(TokenGeneral, [TokenBase]);
