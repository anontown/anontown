import * as t from "io-ts";
import { StorageJSON5 } from "./storage-json-5";

export const storageJSON6 = t.strict({
  ver: t.literal("6"),
  topicFavo: t.array(t.string),
  tagsFavo: t.array(t.array(t.string)),
  topicRead: t.record(
    t.string,
    t.strict({
      res: t.string,
      count: t.number,
    }),
  ),
});

export type StorageJSON6 = t.TypeOf<typeof storageJSON6>;

export function convert5To6(val: StorageJSON5): StorageJSON6 {
  return {
    ver: "6",
    tagsFavo: val.boardFavo.map(x => x.split("/")),
    topicFavo: [],
    topicRead: val.topicRead,
  };
}
