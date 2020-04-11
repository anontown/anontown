import * as t from "io-ts";
import { ngJson } from "./ng-json";
import { StorageJSON6 } from "./storage-json-6";

export const storageJSON7 = t.strict({
  ver: t.literal("7"),
  topicFavo: t.array(t.string),
  tagsFavo: t.array(t.array(t.string)),
  topicRead: t.record(
    t.string,
    t.strict({
      res: t.string,
      count: t.number,
    }),
  ),
  ng: t.array(ngJson),
});

export type StorageJSON7 = t.TypeOf<typeof storageJSON7>;

export function convert6To7(val: StorageJSON6): StorageJSON7 {
  return {
    ...val,
    ver: "7",
    ng: [],
  };
}
