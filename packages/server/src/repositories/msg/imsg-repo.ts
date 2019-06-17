import { IAuthToken } from "../../auth";
import { Msg } from "../../entities";
import * as G from "../../generated/graphql";
import { DateType } from "../../server";

export interface IMsgRepo {
  findOne(id: string): Promise<Msg>;
  insert(msg: Msg): Promise<void>;
  update(msg: Msg): Promise<void>;
  find(authToken: IAuthToken, query: G.MsgQuery, limit: number): Promise<Msg[]>;
}
