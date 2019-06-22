import { fromNullable, Option } from "fp-ts/lib/Option";
import { AtRightError } from "../../at-error";
import { IAuthToken } from "../../auth";
import { IGenerator } from "../../generator";
import { Copyable } from "../../utils";
import { User } from "../user";

export interface IMsgAPI {
  readonly id: string;
  readonly priv: boolean;
  readonly text: string;
  readonly date: string;
}

export class Msg extends Copyable<Msg> {
  static create(
    objidGenerator: IGenerator<string>,
    receiver: Option<User>,
    text: string,
    now: Date,
  ): Msg {
    return new Msg(objidGenerator(), receiver.map(x => x.id), text, now);
  }

  constructor(
    readonly id: string,
    readonly receiver: Option<string>,
    readonly text: string,
    readonly date: Date,
  ) {
    super(Msg);
  }

  toAPI(authToken: IAuthToken): IMsgAPI {
    if (this.receiver.map(x => x !== authToken.user).getOrElse(false)) {
      throw new AtRightError("アクセス権がありません。");
    }

    return {
      id: this.id,
      priv: this.receiver.isSome(),
      text: this.text,
      date: this.date.toISOString(),
    };
  }
}
