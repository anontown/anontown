import * as t from "io-ts";

export const storageJSON1 = t.strict({
  ver: t.literal("1.0.0"),
  topicFav: t.array(t.string),
  topicRead: t.array(
    t.strict({
      topic: t.string,
      res: t.string,
    }),
  ),
});

export type StorageJSON1 = t.TypeOf<typeof storageJSON1>;
