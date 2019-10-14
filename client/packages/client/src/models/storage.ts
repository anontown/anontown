import * as Im from "immutable";
import * as ng from "./ng";
import { StorageJSONLatest } from "./storage-json";
export * from "./storage-json";

export interface Storage {
  readonly topicFavo: Im.Set<string>;
  readonly tagsFavo: Im.Set<Im.Set<string>>;
  readonly topicRead: Im.Map<
    string,
    {
      date: string;
      count: number;
    }
  >;
  readonly topicWrite: Im.Map<
    string,
    {
      name: string;
      profile: string | null;
      text: string;
      replyText: Im.Map<string, string>;
      age: boolean;
    }
  >;
  readonly ng: Im.List<ng.NG>;
}

export function toStorage(json: StorageJSONLatest): Storage {
  return {
    topicFavo: Im.Set(json.topicFavo),
    tagsFavo: Im.Set(json.tagsFavo.map(tags => Im.Set(tags))),
    topicRead: Im.Map(json.topicRead),
    topicWrite: Im.Map(json.topicWrite).map(x => ({
      ...x,
      replyText: Im.Map(x.replyText),
    })),
    ng: Im.List(json.ng.map(x => ng.fromJSON(x))),
  };
}

export function toJSON(storage: Storage): StorageJSONLatest {
  return {
    ver: "9",
    topicFavo: storage.topicFavo.toArray(),
    tagsFavo: storage.tagsFavo.map(tags => tags.toArray()).toArray(),
    topicRead: storage.topicRead.toObject(),
    topicWrite: storage.topicWrite
      .map(x => ({ ...x, replyText: x.replyText.toObject() }))
      .toObject(),
    ng: storage.ng.map(x => ng.toJSON(x)).toArray(),
  };
}
