import * as t from "io-ts";
import { StorageJSON1 } from "./storage-json-1";

export const storageJSON2 = t.strict({
  ver: t.literal("2"),
  topicFav: t.array(t.string),
  topicRead: t.array(
    t.strict({
      topic: t.string,
      res: t.string,
      count: t.number,
    }),
  ),
});

export type StorageJSON2 = t.TypeOf<typeof storageJSON2>;

export function convert1To2(val: StorageJSON1): StorageJSON2 {
  return {
    ver: "2",
    topicFav: val.topicFav,
    topicRead: val.topicRead.map(x => {
      return {
        topic: x.topic,
        res: x.res,
        count: 0,
      };
    }),
  };
}
