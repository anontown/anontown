import { Subject } from "rxjs";
import { Res } from "../../entities";
import { IAuthContainer } from "../auth-container/index";
import { DateQuery } from "../date-query";

export interface ResQuery {
  id: Array<string> | null;
  topic: string | null;
  notice: boolean | null;
  hash: string | null;
  reply: string | null;
  profile: string | null;
  self: boolean | null;
  text: string | null;
  date: DateQuery | null;
}

export const ResQuery: ResQuery = {
  id: null,
  topic: null,
  notice: null,
  hash: null,
  reply: null,
  profile: null,
  self: null,
  text: null,
  date: null,
};

export interface IResRepo {
  readonly insertEvent: Subject<{ res: Res; count: number }>;

  findOne(id: string): Promise<Res>;

  insert(res: Res): Promise<void>;

  update(res: Res): Promise<void>;

  resCount(topicIDs: Array<string>): Promise<Map<string, number>>;

  replyCount(resIDs: Array<string>): Promise<Map<string, number>>;

  find(
    auth: IAuthContainer,
    query: ResQuery,
    limit: number,
  ): Promise<Array<Res>>;

  dispose(): void;
}
