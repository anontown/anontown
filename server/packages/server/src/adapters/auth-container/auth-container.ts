import { option } from "fp-ts";
import { Option } from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/pipeable";
import { AtAuthError } from "../../at-error";
import { IAuthToken, IAuthTokenMaster } from "../../auth";
import { IAuthContainer } from "../../ports/index";

export class AuthContainer implements IAuthContainer {
  constructor(private _token: Option<IAuthToken>) {}

  getToken(): IAuthToken {
    if (option.isNone(this._token)) {
      throw new AtAuthError("認証が必要です");
    }

    return this._token.value;
  }

  getTokenMaster(): IAuthTokenMaster {
    const t = this.getToken();
    if (t.type === "general") {
      throw new AtAuthError("マスタートークンでの認証が必要です");
    }
    return t;
  }

  getTokenOrNull(): Option<IAuthToken> {
    return this._token;
  }

  getTokenMasterOrNull(): Option<IAuthTokenMaster> {
    return pipe(
      this._token,
      option.chain(token =>
        token.type === "master" ? option.some(token) : option.none,
      ),
    );
  }
}
