import { option } from "fp-ts";
import { none, Option, some } from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/pipeable";
import { AtRightError, paramsErrorMaker } from "../../at-error";
import { IAuthToken } from "../../auth";
import { Constant } from "../../constant";
import { Copyable } from "../../utils";

export interface IStorageAPI {
  key: string;
  value: string;
}

export class Storage extends Copyable<Storage> {
  static create(authToken: IAuthToken, key: string, value: string): Storage {
    paramsErrorMaker([
      {
        field: "key",
        val: key,
        regex: Constant.storage.key.regex,
        message: Constant.storage.key.msg,
      },
      {
        field: "value",
        val: value,
        regex: Constant.storage.value.regex,
        message: Constant.storage.value.msg,
      },
    ]);

    return new Storage(
      authToken.type === "general" ? some(authToken.client) : none,
      authToken.user,
      key,
      value,
    );
  }

  constructor(
    readonly client: Option<string>,
    readonly user: string,
    readonly key: string,
    readonly value: string,
  ) {
    super(Storage);
  }

  toAPI(authToken: IAuthToken): IStorageAPI {
    if (
      authToken.user !== this.user ||
      (authToken.type === "master" ? null : authToken.client) !==
        pipe(this.client, option.toNullable)
    ) {
      throw new AtRightError("権限がありません");
    }

    return {
      key: this.key,
      value: this.value,
    };
  }
}
