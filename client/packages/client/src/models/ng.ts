import { isNullish } from "@kgtkr/utils";
import * as Im from "immutable";
import * as uuid from "uuid";
import * as G from "../generated/graphql";
import * as ngJson from "./storage-json/ng-json";

export function createDefaultNode(): NGNode {
  return {
    id: uuid.v4(),
    type: "and",
    children: Im.List(),
  };
}

export function createDefaultNG(): NG {
  return {
    id: uuid.v4(),
    name: "新規設定",
    topic: null,
    date: new Date(),
    expirationDate: null,
    chain: 1,
    transparent: false,
    node: createDefaultNode(),
  };
}

// TODO:chain
export function isNG(ng: NG, res: G.ResFragment) {
  if (ng.topic !== null && ng.topic !== res.topic.id) {
    return false;
  }

  if (
    ng.expirationDate !== null &&
    ng.expirationDate.valueOf() < new Date(res.date).valueOf()
  ) {
    return false;
  }

  return !!isNodeNG(ng.node, res);
}

function isNodeNG(node: NGNode, res: G.ResFragment): boolean | null {
  switch (node.type) {
    case "not":
      const b = isNodeNG(node.child, res);
      return b !== null ? !b : null;
    case "and":
      return node.children.size === 0
        ? null
        : node.children.every(x => !!isNodeNG(x, res));
    case "or":
      return node.children.size === 0
        ? null
        : node.children.some(x => !!isNodeNG(x, res));
    case "profile":
      return (
        res.__typename === "ResNormal" &&
        !isNullish(res.profile) &&
        node.profile === res.profile.id
      );
    case "hash":
      return res.hash === node.hash;
    case "text":
      return (
        res.__typename === "ResNormal" &&
        textMatcherTest(node.matcher, res.text)
      );
    case "name":
      return (
        res.__typename === "ResNormal" &&
        !isNullish(res.name) &&
        textMatcherTest(node.matcher, res.name)
      );
    case "vote":
      return res.uv - res.dv < node.value;
  }
}

function textMatcherTest(
  matcher: NGNodeTextMatcher,
  text: string,
): boolean | null {
  if (matcher.source.length === 0) {
    return null;
  }
  switch (matcher.type) {
    case "reg":
      try {
        return new RegExp(matcher.source, [matcher.i ? "i" : ""].join("")).test(
          text,
        );
      } catch {
        return null;
      }
    case "text":
      if (matcher.i) {
        return text.toLowerCase().includes(matcher.source.toLowerCase());
      } else {
        return text.includes(matcher.source);
      }
  }
}

export function toJSON(ng: NG): ngJson.NGJson {
  return {
    name: ng.name,
    topic: ng.topic,
    node: toJSONNode(ng.node),
    expirationDate:
      ng.expirationDate !== null ? ng.expirationDate.toISOString() : null,
    date: ng.date.toISOString(),
    chain: ng.chain,
    transparent: ng.transparent,
  };
}

function toJSONMatcher(
  matcher: NGNodeTextMatcher,
): ngJson.NGNodeTextMatcherJson {
  switch (matcher.type) {
    case "reg":
      return matcher;
    case "text":
      return matcher;
  }
}

function toJSONNode(node: NGNode): ngJson.NGNodeJson {
  switch (node.type) {
    case "not":
      return { type: "not", child: toJSONNode(node.child) };
    case "and":
      return {
        type: "and",
        children: node.children.map(x => toJSONNode(x)).toArray(),
      };
    case "or":
      return {
        type: "or",
        children: node.children.map(x => toJSONNode(x)).toArray(),
      };
    case "profile":
      return node;
    case "hash":
      return node;
    case "text":
      return { type: "text", matcher: toJSONMatcher(node.matcher) };
    case "name":
      return { type: "name", matcher: toJSONMatcher(node.matcher) };
    case "vote":
      return node;
  }
}

export function fromJSON(json: ngJson.NGJson): NG {
  return {
    id: uuid.v4(),
    ...json,
    node: fromJSONNode(json.node),
    expirationDate:
      json.expirationDate !== null ? new Date(json.expirationDate) : null,
    date: new Date(json.date),
  };
}

function fromJSONTextMatcher(
  matcher: ngJson.NGNodeTextMatcherJson,
): NGNodeTextMatcher {
  switch (matcher.type) {
    case "reg":
      return matcher;
    case "text":
      return matcher;
  }
}

function fromJSONNode(node: ngJson.NGNodeJson): NGNode {
  switch (node.type) {
    case "not":
      return { id: uuid.v4(), type: "not", child: fromJSONNode(node.child) };
    case "and":
      return {
        id: uuid.v4(),
        type: "and",
        children: Im.List(node.children.map(x => fromJSONNode(x))),
      };
    case "or":
      return {
        id: uuid.v4(),
        type: "or",
        children: Im.List(node.children.map(x => fromJSONNode(x))),
      };
    case "profile":
      return { id: uuid.v4(), ...node };
    case "hash":
      return { id: uuid.v4(), ...node };
    case "text":
      return {
        id: uuid.v4(),
        type: "text",
        matcher: fromJSONTextMatcher(node.matcher),
      };
    case "name":
      return {
        id: uuid.v4(),
        type: "name",
        matcher: fromJSONTextMatcher(node.matcher),
      };
    case "vote":
      return { id: uuid.v4(), ...node };
  }
}

export interface NG {
  readonly id: string;
  readonly name: string;
  readonly topic: string | null;
  readonly date: Date;
  readonly expirationDate: Date | null;
  readonly node: NGNode;
  readonly chain: number;
  readonly transparent: boolean;
}

export type NGNode =
  | NGNodeNot
  | NGNodeAnd
  | NGNodeOr
  | NGNodeProfile
  | NGNodeHash
  | NGNodeText
  | NGNodeName
  | NGNodeVote;

export interface NGNodeNot {
  readonly id: string;
  readonly type: "not";
  readonly child: NGNode;
}

export interface NGNodeAnd {
  readonly id: string;
  readonly type: "and";
  readonly children: Im.List<NGNode>;
}

export interface NGNodeOr {
  readonly id: string;
  readonly type: "or";
  readonly children: Im.List<NGNode>;
}

export interface NGNodeProfile {
  readonly id: string;
  readonly type: "profile";
  readonly profile: string;
}

export interface NGNodeHash {
  readonly id: string;
  readonly type: "hash";
  readonly hash: string;
}

export type NGNodeTextMatcher = NGNodeTextMatcherReg | NGNodeTextMatcherText;
export interface NGNodeTextMatcherReg {
  readonly type: "reg";
  readonly source: string;
  readonly i: boolean;
}

export interface NGNodeTextMatcherText {
  readonly type: "text";
  readonly source: string;
  readonly i: boolean;
}

export interface NGNodeText {
  readonly id: string;
  readonly type: "text";
  readonly matcher: NGNodeTextMatcher;
}

export interface NGNodeName {
  readonly id: string;
  readonly type: "name";
  readonly matcher: NGNodeTextMatcher;
}

export interface NGNodeVote {
  readonly id: string;
  readonly type: "vote";
  readonly value: number;
}
