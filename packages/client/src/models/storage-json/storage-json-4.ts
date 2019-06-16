import * as t from "io-ts";
import { StorageJSON3 } from "./storage-json-3";

export const storageJSON4 = t.strict({
  ver: t.literal("4"),
  topicFavo: t.array(t.string),
  boardFavo: t.array(t.string),
  topicRead: t.record(
    t.string,
    t.strict({
      res: t.string,
      count: t.number,
    }),
  ),
});

export type StorageJSON4 = t.TypeOf<typeof storageJSON4>;

export function convert3To4(val: StorageJSON3): StorageJSON4 {
  return {
    ver: "4",
    boardFavo: [],
    topicFavo: val.topicFavo,
    topicRead: val.topicRead,
  };
}
