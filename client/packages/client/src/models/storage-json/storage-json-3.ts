import * as t from "io-ts";
import { StorageJSON2 } from "./storage-json-2";

export const storageJSON3 = t.strict({
  ver: t.literal("3"),
  topicFavo: t.array(t.string),
  topicRead: t.record(
    t.string,
    t.strict({
      res: t.string,
      count: t.number,
    }),
  ),
});

export type StorageJSON3 = t.TypeOf<typeof storageJSON3>;

export function convert2To3(val: StorageJSON2): StorageJSON3 {
  const read: { [key: string]: { res: string; count: number } } = {};
  val.topicRead.forEach(x => (read[x.topic] = { res: x.res, count: x.count }));
  return {
    ver: "3",
    topicFavo: val.topicFav,
    topicRead: read,
  };
}
