import { Option } from "fp-ts/lib/Option";
import { AtRightError } from "../../at-error";
import { IAuthToken } from "../../auth";
import { IGenerator } from "../../generator";
import { Copyable } from "../../utils";
import { User } from "../user";
import { pipe } from "fp-ts/lib/pipeable";
import { option } from "fp-ts";

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
    return new Msg(
      objidGenerator(),
      pipe(
        receiver,
        option.map(x => x.id),
      ),
      text,
      now,
    );
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
    if (
      pipe(
        this.receiver,
        option.map(x => x !== authToken.user),
        option.getOrElse(() => false),
      )
    ) {
      throw new AtRightError("アクセス権がありません。");
    }

    return {
      id: this.id,
      priv: pipe(
        this.receiver,
        option.isSome,
      ),
      text: this.text,
      date: this.date.toISOString(),
    };
  }
}
