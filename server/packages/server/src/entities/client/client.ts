import { option } from "fp-ts";
import { Option } from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/pipeable";
import { AtRightError, paramsErrorMaker } from "../../at-error";
import { IAuthTokenMaster } from "../../auth";
import { Constant } from "../../constant";
import { IObjectIdGenerator } from "../../ports";
import { Copyable } from "../../utils";

export interface IClientAPI {
  readonly id: string;
  readonly name: string;
  readonly url: string;
  /*
    マスター権限で認証していなければnull。自分のクライアントかどうか
  */
  readonly self: boolean | null;
  readonly date: string;
  readonly update: string;
}

export class Client extends Copyable<Client> {
  static create(
    objidGenerator: IObjectIdGenerator,
    authToken: IAuthTokenMaster,
    name: string,
    url: string,
    now: Date,
  ): Client {
    paramsErrorMaker([
      {
        field: "name",
        val: name,
        regex: Constant.client.name.regex,
        message: Constant.client.name.msg,
      },
      {
        field: "url",
        val: url,
        regex: Constant.client.url.regex,
        message: Constant.client.url.msg,
      },
    ]);

    return new Client(
      objidGenerator.generateObjectId(),
      name,
      url,
      authToken.user,
      now,
      now,
    );
  }

  constructor(
    readonly id: string,
    readonly name: string,
    readonly url: string,
    readonly user: string,
    readonly date: Date,
    readonly update: Date,
  ) {
    super(Client);
  }

  toAPI(authToken: Option<IAuthTokenMaster>): IClientAPI {
    return {
      id: this.id,
      name: this.name,
      url: this.url,
      self: pipe(
        authToken,
        option.map(authToken => authToken.user === this.user),
        option.toNullable,
      ),
      date: this.date.toISOString(),
      update: this.update.toISOString(),
    };
  }

  changeData(
    authToken: IAuthTokenMaster,
    name: string | undefined,
    url: string | undefined,
    now: Date,
  ): Client {
    if (authToken.user !== this.user) {
      throw new AtRightError("人のクライアント変更は出来ません");
    }
    paramsErrorMaker([
      {
        field: "name",
        val: name,
        regex: Constant.client.name.regex,
        message: Constant.client.name.msg,
      },
      {
        field: "url",
        val: url,
        regex: Constant.client.url.regex,
        message: Constant.client.url.msg,
      },
    ]);

    return this.copy({ name, url, update: now });
  }
}
