import * as t from "io-ts";
import { ngJson } from "./ng-json";
import { StorageJSON8 } from "./storage-json-8";

export const storageJSON9 = t.strict({
  ver: t.literal("9"),
  topicFavo: t.array(t.string),
  tagsFavo: t.array(t.array(t.string)),
  topicRead: t.record(
    t.string,
    t.strict({
      date: t.string,
      count: t.number,
    }),
  ),
  topicWrite: t.record(
    t.string,
    t.strict({
      name: t.string,
      profile: t.union([t.string, t.null]),
      text: t.string,
      age: t.boolean,
      replyText: t.record(t.string, t.string),
    }),
  ),
  ng: t.array(ngJson),
});

export type StorageJSON9 = t.TypeOf<typeof storageJSON9>;

export function convert8To9(val: StorageJSON8): StorageJSON9 {
  return {
    ...val,
    ver: "9",
    topicWrite: {},
  };
}
