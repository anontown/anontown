import { Option } from "fp-ts/lib/Option";
import { IAuthToken, IAuthTokenMaster } from "../../auth";

export interface IAuthContainer {
  getToken(): IAuthToken;

  getTokenMaster(): IAuthTokenMaster;

  getTokenOrNull(): Option<IAuthToken>;

  getTokenMasterOrNull(): Option<IAuthTokenMaster>;
}
