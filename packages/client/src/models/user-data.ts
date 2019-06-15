import * as G from "../../generated/graphql";
import { Storage } from "./storage";

export interface UserData {
  token: G.TokenMasterFragment;
  storage: Storage;
  id: string;
}
