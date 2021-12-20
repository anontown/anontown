import { Observable } from "rxjs";
import { Res } from "../../entities";
import * as G from "../../generated/graphql";
import { IAuthContainer } from "../auth-container/index";

export interface IResRepo {
  subscribeInsertEvent(): Observable<{ res: Res; count: number }>;

  findOne(id: string): Promise<Res>;

  insert(res: Res): Promise<void>;

  update(res: Res): Promise<void>;

  resCount(topicIDs: Array<string>): Promise<Map<string, number>>;

  replyCount(resIDs: Array<string>): Promise<Map<string, number>>;

  find(
    auth: IAuthContainer,
    query: G.ResQuery,
    limit: number,
  ): Promise<Array<Res>>;
}
