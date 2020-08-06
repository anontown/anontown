import { IAuthToken } from "../../auth";
import { Msg } from "../../entities";
import { DateQuery } from "../date-query";

export interface MsgQuery {
  id: Array<string> | null;
  date: DateQuery | null;
}

export const MsgQuery: MsgQuery = {
  id: null,
  date: null,
};

export interface IMsgRepo {
  findOne(id: string): Promise<Msg>;
  insert(msg: Msg): Promise<void>;
  update(msg: Msg): Promise<void>;
  find(
    authToken: IAuthToken,
    query: MsgQuery,
    limit: number,
  ): Promise<Array<Msg>>;
}
