import * as t from "io-ts";
import * as G from "../../generated/graphql";
import { gqlClient } from "../../utils";
import { ngJson } from "./ng-json";
import { StorageJSON7 } from "./storage-json-7";

export const storageJSON8 = t.strict({
  ver: t.literal("8"),
  topicFavo: t.array(t.string),
  tagsFavo: t.array(t.array(t.string)),
  topicRead: t.record(
    t.string,
    t.strict({
      date: t.string,
      count: t.number,
    }),
  ),
  ng: t.array(ngJson),
});

export type StorageJSON8 = t.TypeOf<typeof storageJSON8>;

export async function convert7To8(val: StorageJSON7): Promise<StorageJSON8> {
  const topicRead: StorageJSON8["topicRead"] = {};
  const dates = new Map(
    (await gqlClient.query<G.FindResesQuery, G.FindResesQueryVariables>({
      query: G.FindResesDocument,
      variables: {
        query: {
          id: Object.entries(val.topicRead).map(([_l, { res }]) => res),
        },
      },
    })).data.reses.map<[string, string]>(x => [x.id, x.date]),
  );
  for (const topic of Object.keys(val.topicRead)) {
    const data = val.topicRead[topic];
    topicRead[topic] = { count: data.count, date: dates.get(data.res)! };
  }
  return {
    ...val,
    ver: "8",
    topicRead,
  };
}
