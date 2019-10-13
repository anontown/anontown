import * as t from "io-ts";
import { StorageJSON4 } from "./storage-json-4";

// バグでtopicFavoが壊れたのでリセットする用
export const storageJSON5 = t.strict({
  ver: t.literal("5"),
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

export type StorageJSON5 = t.TypeOf<typeof storageJSON5>;

export function convert4To5(val: StorageJSON4): StorageJSON5 {
  return {
    ver: "5",
    boardFavo: val.boardFavo,
    topicFavo: [],
    topicRead: val.topicRead,
  };
}
