import * as t from "io-ts";

export const ngNodeNotJson: t.Type<NGNodeNotJson> = t.recursion(
  "NGNodeNotJSON",
  () =>
    t.strict({
      type: t.literal("not"),
      child: ngNodeJson,
    }),
);
export interface NGNodeNotJson {
  readonly type: "not";
  readonly child: NGNodeJson;
}

export const ngNodeAndJson: t.Type<NGNodeAndJson> = t.recursion(
  "NGNodeAndJson",
  () =>
    t.strict({
      type: t.literal("and"),
      children: t.array(ngNodeJson),
    }),
);

export interface NGNodeAndJson {
  readonly type: "and";
  readonly children: Array<NGNodeJson>;
}

export const ngNodeOrJson: t.Type<NGNodeOrJson> = t.recursion(
  "NGNodeOrJson",
  () =>
    t.strict({
      type: t.literal("or"),
      children: t.array(ngNodeJson),
    }),
);

export interface NGNodeOrJson {
  readonly type: "or";
  readonly children: Array<NGNodeJson>;
}

export const ngNodeProfileJson = t.strict({
  type: t.literal("profile"),
  profile: t.string,
});

export type NGNodeProfileJson = t.TypeOf<typeof ngNodeProfileJson>;

export const ngNodeHashJson = t.strict({
  type: t.literal("hash"),
  hash: t.string,
});

export type NGNodeHashJson = t.TypeOf<typeof ngNodeHashJson>;

export const ngNodeTextMatcherRegJson = t.strict({
  type: t.literal("reg"),
  source: t.string,
  i: t.boolean,
});

export type NGNodeTextMatcherRegJson = t.TypeOf<
  typeof ngNodeTextMatcherRegJson
>;

export const ngNodeTextMatcherTextJson = t.strict({
  type: t.literal("text"),
  source: t.string,
  i: t.boolean,
});

export type NGNodeTextMatcherTextJson = t.TypeOf<
  typeof ngNodeTextMatcherTextJson
>;

export const ngNodeTextMatcherJson = t.taggedUnion("type", [
  ngNodeTextMatcherRegJson,
  ngNodeTextMatcherTextJson,
]);

export type NGNodeTextMatcherJson = t.TypeOf<typeof ngNodeTextMatcherJson>;

export const ngNodeTextJson = t.strict({
  type: t.literal("text"),
  matcher: ngNodeTextMatcherJson,
});

export type NGNodeTextJson = t.TypeOf<typeof ngNodeTextJson>;

export const ngNodeNameJson = t.strict({
  type: t.literal("name"),
  matcher: ngNodeTextMatcherJson,
});

export type NGNodeNameJson = t.TypeOf<typeof ngNodeNameJson>;

export const ngNodeVoteJson = t.strict({
  type: t.literal("vote"),
  value: t.number,
});

export type NGNodeVoteJson = t.TypeOf<typeof ngNodeVoteJson>;

export const ngNodeJson: t.Type<NGNodeJson> = t.recursion("NGNodeJSON", () =>
  t.taggedUnion("type", [
    ngNodeNotJson,
    ngNodeAndJson,
    ngNodeOrJson,
    ngNodeProfileJson,
    ngNodeHashJson,
    ngNodeTextJson,
    ngNodeNameJson,
    ngNodeVoteJson,
  ]),
);

export type NGNodeJson =
  | NGNodeNotJson
  | NGNodeAndJson
  | NGNodeOrJson
  | NGNodeProfileJson
  | NGNodeHashJson
  | NGNodeTextJson
  | NGNodeNameJson
  | NGNodeVoteJson;

export const ngJson = t.strict({
  name: t.string,
  topic: t.union([t.null, t.string]),
  date: t.string,
  expirationDate: t.union([t.null, t.string]),
  node: ngNodeJson,
  chain: t.number,
  transparent: t.boolean,
});

export type NGJson = t.TypeOf<typeof ngJson>;
