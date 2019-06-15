import { isNullish } from "@kgtkr/utils";
import { AtNotFoundError } from "../../at-error";
import { IAuthToken } from "../../auth";
import * as G from "../../generated/graphql";
import { IMsgRepo } from "./imsg-repo";
import { IMsgDB, Msg } from "./msg";

export class MsgRepoMock implements IMsgRepo {
  private msgs: IMsgDB[] = [];

  async findOne(id: string): Promise<Msg> {
    const msg = this.msgs.find(x => x.id === id);

    if (msg === undefined) {
      throw new AtNotFoundError("メッセージが存在しません");
    }

    return Msg.fromDB(msg);
  }

  async find(
    authToken: IAuthToken,
    query: G.MsgQuery,
    limit: number): Promise<Msg[]> {
    const msgs = this.msgs
      .filter(x => x.body.receiver === null || x.body.receiver === authToken.user)
      .filter(x => isNullish(query.id) || query.id.includes(x.id))
      .filter(x => {
        if (isNullish(query.date)) {
          return true;
        }
        const dateV = new Date(query.date.date).valueOf();
        const xDateV = new Date(x.body.date).valueOf();
        switch (query.date.type) {
          case "gte":
            return dateV <= xDateV;
          case "gt":
            return dateV < xDateV;
          case "lte":
            return dateV >= xDateV;
          case "lt":
            return dateV > xDateV;
        }
      })
      .sort((a, b) => {
        const av = new Date(a.body.date).valueOf();
        const bv = new Date(b.body.date).valueOf();
        return !isNullish(query.date) && (query.date.type === "gt" || query.date.type === "gte") ? av - bv : bv - av;
      })
      .slice(0, limit);

    const result = msgs.map(x => Msg.fromDB(x));
    if (!isNullish(query.date) && (query.date.type === "gt" || query.date.type === "gte")) {
      result.reverse();
    }
    return result;
  }

  async insert(msg: Msg): Promise<void> {
    this.msgs.push(msg.toDB());
  }

  async update(msg: Msg): Promise<void> {
    this.msgs[this.msgs.findIndex(x => x.id === msg.id)] = msg.toDB();
  }
}
