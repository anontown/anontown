import * as Im from "immutable";
import { History } from "../../entities";

export interface IHistoryDB {
  readonly id: string;
  readonly body: {
    readonly topic: string;
    readonly title: string;
    readonly tags: Array<string>;
    readonly text: string;
    readonly date: string;
    readonly hash: string;
    readonly user: string;
  };
}

export function toHistory(h: IHistoryDB): History {
  return new History(
    h.id,
    h.body.topic,
    h.body.title,
    Im.List(h.body.tags),
    h.body.text,
    new Date(h.body.date),
    h.body.hash,
    h.body.user,
  );
}

export function fromHistory(history: History): IHistoryDB {
  return {
    id: history.id,
    body: {
      topic: history.topic,
      title: history.title,
      tags: history.tags.toArray(),
      text: history.text,
      date: history.date.toISOString(),
      hash: history.hash,
      user: history.user,
    },
  };
}
