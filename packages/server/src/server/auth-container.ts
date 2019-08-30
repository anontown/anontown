import { option } from "fp-ts";
import { Option } from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/pipeable";
import { AtAuthError } from "../at-error";
import { IAuthToken, IAuthTokenMaster } from "../auth";

export class AuthContainer {
  constructor(private _token: Option<IAuthToken>) {}

  get token(): IAuthToken {
    if (option.isNone(this._token)) {
      throw new AtAuthError("認証が必要です");
    }

    return this._token.value;
  }

  get tokenMaster(): IAuthTokenMaster {
    const t = this.token;
    if (t.type === "general") {
      throw new AtAuthError("マスタートークンでの認証が必要です");
    }
    return t;
  }

  get tokenOrNull(): Option<IAuthToken> {
    return this._token;
  }

  get tokenMasterOrNull(): Option<IAuthTokenMaster> {
    return pipe(
      this._token,
      option.chain(token =>
        token.type === "master" ? option.some(token) : option.none,
      ),
    );
  }
}
