import {
  AtPrerequisiteError,
  AtUserAuthError,
  paramsErrorMaker,
} from "../../at-error";
import { IAuthUser } from "../../auth";
import { Config } from "../../config";
import { Constant } from "../../constant";
import { IObjectIdGenerator } from "../../ports";
import { Copyable } from "../../utils";
import { hash } from "../../utils";

export type ResWaitCountKey = Exclude<keyof IResWait, "last">;

export interface IUserAPI {
  readonly id: string;
  readonly sn: string;
}

export interface IResWait {
  readonly last: Date;
  readonly m10: number;
  readonly m30: number;
  readonly h1: number;
  readonly h6: number;
  readonly h12: number;
  readonly d1: number;
}

export class User extends Copyable<User> {
  static create(
    objidGenerator: IObjectIdGenerator,
    sn: string,
    pass: string,
    now: Date,
  ): User {
    paramsErrorMaker([
      {
        field: "pass",
        val: pass,
        regex: Constant.user.pass.regex,
        message: Constant.user.pass.msg,
      },
      {
        field: "sn",
        val: sn,
        regex: Constant.user.sn.regex,
        message: Constant.user.sn.msg,
      },
    ]);

    return new User(
      objidGenerator.generateObjectId(),
      sn,
      hash(pass + Config.salt.pass),
      1,
      { last: now, m10: 0, m30: 0, h1: 0, h6: 0, h12: 0, d1: 0 },
      now,
      now,
      0,
      now,
    );
  }

  constructor(
    readonly id: string,
    readonly sn: string,
    readonly pass: string,
    readonly lv: number,
    readonly resWait: IResWait,
    readonly lastTopic: Date,
    readonly date: Date,
    // 毎日リセットされ、特殊動作をすると増えるポイント
    readonly point: number,
    readonly lastOneTopic: Date,
  ) {
    super(User);
  }

  toAPI(): IUserAPI {
    return {
      id: this.id,
      sn: this.sn,
    };
  }

  change(
    _authUser: IAuthUser,
    pass: string | undefined,
    sn: string | undefined,
  ): User {
    paramsErrorMaker([
      {
        field: "pass",
        val: pass,
        regex: Constant.user.pass.regex,
        message: Constant.user.pass.msg,
      },
      {
        field: "sn",
        val: sn,
        regex: Constant.user.sn.regex,
        message: Constant.user.sn.msg,
      },
    ]);

    return this.copy({
      pass: pass !== undefined ? hash(pass + Config.salt.pass) : undefined,
      sn,
    });
  }

  auth(pass: string): IAuthUser {
    if (this.pass === hash(pass + Config.salt.pass)) {
      return { id: this.id, pass: this.pass };
    } else {
      throw new AtUserAuthError();
    }
  }

  usePoint(val: number): User {
    if (this.lv < this.point + val) {
      throw new AtPrerequisiteError("LVが足りません");
    }
    return this.copy({ point: this.point + val });
  }

  changeLv(lv: number): User {
    return this.copy({
      lv: lv < 1 ? 1 : lv > Constant.user.lvMax ? Constant.user.lvMax : lv,
    });
  }

  changeLastRes(lastRes: Date): User {
    // 条件
    // 係数
    // Constant.user.lvMaxの時、Constant.res.wait.maxLv倍緩和
    const coe =
      (this.lv / Constant.user.lvMax) * (Constant.res.wait.maxLv - 1) + 1;
    if (
      this.resWait.d1 < Constant.res.wait.d1 * coe &&
      this.resWait.h12 < Constant.res.wait.h12 * coe &&
      this.resWait.h6 < Constant.res.wait.h6 * coe &&
      this.resWait.h1 < Constant.res.wait.h1 * coe &&
      this.resWait.m30 < Constant.res.wait.m30 * coe &&
      this.resWait.m10 < Constant.res.wait.m10 * coe &&
      this.resWait.last.getTime() + 1000 * Constant.res.wait.minSecond <
        lastRes.getTime()
    ) {
      return this.copy({
        resWait: {
          d1: this.resWait.d1 + 1,
          h12: this.resWait.h12 + 1,
          h6: this.resWait.h6 + 1,
          h1: this.resWait.h1 + 1,
          m30: this.resWait.m30 + 1,
          m10: this.resWait.m10 + 1,
          last: lastRes,
        },
      });
    } else {
      throw new AtPrerequisiteError("連続書き込みはできません");
    }
  }
  changeLastTopic(lastTopic: Date): User {
    if (this.lastTopic.getTime() + 1000 * 60 * 30 < lastTopic.getTime()) {
      return this.copy({ lastTopic });
    } else {
      throw new AtPrerequisiteError("連続書き込みはできません");
    }
  }

  changeLastOneTopic(lastTopic: Date): User {
    if (this.lastOneTopic.getTime() + 1000 * 60 * 10 < lastTopic.getTime()) {
      return this.copy({ lastOneTopic: lastTopic });
    } else {
      throw new AtPrerequisiteError("連続書き込みはできません");
    }
  }
}
