import { isNullish } from "@kgtkr/utils";
import { Subject } from "rxjs";
import { AtNotFoundError } from "../../at-error";
import { Res } from "../../entities";
import * as G from "../../generated/graphql";
import { IAuthContainer, IResRepo } from "../../ports";
import { fromRes, IResDB, toRes } from "./ires-db";

export class ResRepoMock implements IResRepo {
  readonly insertEvent: Subject<{ res: Res; count: number }> = new Subject<{
    res: Res;
    count: number;
  }>();
  private reses: Array<IResDB> = [];

  async findOne(id: string): Promise<Res> {
    const res = this.reses.find(x => x.id === id);

    if (res === undefined) {
      throw new AtNotFoundError("レスが存在しません");
    }

    return (await this.aggregate([res]))[0];
  }

  async insert(res: Res): Promise<void> {
    this.reses.push(fromRes(res));

    const resCount = (await this.resCount([res.topic])).get(res.topic) || 0;
    this.insertEvent.next({ res, count: resCount });
  }

  async update(res: Res): Promise<void> {
    this.reses[this.reses.findIndex(x => x.id === res.id)] = fromRes(res);
  }

  async resCount(topicIDs: Array<string>): Promise<Map<string, number>> {
    return this.reses
      .filter(x => topicIDs.includes(x.body.topic))
      .map(x => x.body.topic)
      .reduce(
        (c, x) => c.set(x, (c.get(x) || 0) + 1),
        new Map<string, number>(),
      );
  }

  async replyCount(resIDs: Array<string>): Promise<Map<string, number>> {
    return this.reses
      .map(x =>
        x.body.type === "normal" && x.body.reply !== null
          ? x.body.reply.res
          : null,
      )
      .filter<string>((x): x is string => x !== null && resIDs.includes(x))
      .reduce(
        (c, x) => c.set(x, (c.get(x) || 0) + 1),
        new Map<string, number>(),
      );
  }

  async find(
    auth: IAuthContainer,
    query: G.ResQuery,
    limit: number,
  ): Promise<Array<Res>> {
    const notice = query.notice ? auth.getToken().user : null;
    const self = query.self ? auth.getToken().user : null;
    const texts = !isNullish(query.text)
      ? query.text.split(/\s/).filter(x => x.length !== 0)
      : null;

    const reses = this.reses
      .filter(x => isNullish(query.id) || query.id.includes(x.id))
      .filter(x => isNullish(query.topic) || x.body.topic === query.topic)
      .filter(
        x =>
          notice === null ||
          (x.body.type === "normal" &&
            x.body.reply !== null &&
            x.body.reply.user === notice),
      )
      .filter(x => isNullish(query.hash) || x.body.hash === query.hash)
      .filter(
        x =>
          isNullish(query.reply) ||
          (x.body.type === "normal" &&
            x.body.reply !== null &&
            x.body.reply.res === query.reply),
      )
      .filter(
        x =>
          isNullish(query.profile) ||
          (x.body.type === "normal" &&
            x.body.profile !== null &&
            x.body.profile === query.profile),
      )
      .filter(x => self === null || x.body.user === self)
      .filter(
        x =>
          texts === null ||
          texts.every(t => x.body.type === "normal" && x.body.text.includes(t)),
      )
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
        return !isNullish(query.date) &&
          (query.date.type === "gt" || query.date.type === "gte")
          ? av - bv
          : bv - av;
      })
      .slice(0, limit);

    const result = await this.aggregate(reses);
    if (
      !isNullish(query.date) &&
      (query.date.type === "gt" || query.date.type === "gte")
    ) {
      result.reverse();
    }
    return result;
  }

  dispose(): void {}

  private async aggregate(reses: Array<IResDB>): Promise<Array<Res>> {
    const count = await this.replyCount(reses.map(x => x.id));
    return reses.map(r => toRes(r, count.get(r.id) || 0));
  }
}
