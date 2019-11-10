import { option } from "fp-ts";
import { Option } from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/pipeable";
import { AtRightError, paramsErrorMaker } from "../../at-error";
import { IAuthToken } from "../../auth";
import { Constant } from "../../constant";
import { IObjectIdGenerator } from "../../ports";
import { Copyable } from "../../utils";

/*
self: 認証していなければnull。自分のprofileか
*/
export interface IProfileAPI {
  readonly id: string;
  readonly self: boolean | null;
  readonly name: string;
  readonly text: string;
  readonly date: string;
  readonly update: string;
  readonly sn: string;
}

export class Profile extends Copyable<Profile> {
  static create(
    objidGenerator: IObjectIdGenerator,
    authToken: IAuthToken,
    name: string,
    text: string,
    sn: string,
    now: Date,
  ): Profile {
    paramsErrorMaker([
      {
        field: "name",
        val: name,
        regex: Constant.profile.name.regex,
        message: Constant.profile.name.msg,
      },
      {
        field: "text",
        val: text,
        regex: Constant.profile.text.regex,
        message: Constant.profile.text.msg,
      },
      {
        field: "sn",
        val: sn,
        regex: Constant.profile.sn.regex,
        message: Constant.profile.sn.msg,
      },
    ]);

    return new Profile(
      objidGenerator.generateObjectId(),
      authToken.user,
      name,
      text,
      now,
      now,
      sn,
    );
  }

  constructor(
    readonly id: string,
    readonly user: string,
    readonly name: string,
    readonly text: string,
    readonly date: Date,
    readonly update: Date,
    readonly sn: string,
  ) {
    super(Profile);
  }

  toAPI(authToken: Option<IAuthToken>): IProfileAPI {
    return {
      id: this.id,
      self: pipe(
        authToken,
        option.map(authToken => authToken.user === this.user),
        option.toNullable,
      ),
      name: this.name,
      text: this.text,
      date: this.date.toISOString(),
      update: this.update.toISOString(),
      sn: this.sn,
    };
  }

  changeData(
    authToken: IAuthToken,
    name: string | undefined,
    text: string | undefined,
    sn: string | undefined,
    now: Date,
  ) {
    if (authToken.user !== this.user) {
      throw new AtRightError("人のプロフィール変更は出来ません");
    }
    paramsErrorMaker([
      {
        field: "name",
        val: name,
        regex: Constant.profile.name.regex,
        message: Constant.profile.name.msg,
      },
      {
        field: "text",
        val: text,
        regex: Constant.profile.text.regex,
        message: Constant.profile.text.msg,
      },
      {
        field: "sn",
        val: sn,
        regex: Constant.profile.sn.regex,
        message: Constant.profile.sn.msg,
      },
    ]);

    return this.copy({
      name,
      text,
      sn,
      update: now,
    });
  }
}
