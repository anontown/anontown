import { PathDataBuilder, RouteData } from "./route-data";

export const home = RouteData.create(PathDataBuilder.create().const(""));
export const res = RouteData.create(
  PathDataBuilder.create()
    .const("topics")
    .variable("topic")
    .const("reses")
    .variable("id"),
);
export const resReply = RouteData.create(
  PathDataBuilder.create()
    .const("topics")
    .variable("topic")
    .const("reses")
    .variable("id")
    .const("reply"),
);
export const hash = RouteData.create(
  PathDataBuilder.create()
    .const("topics")
    .variable("topic")
    .const("hashes")
    .variable("hash"),
);
export const topicSearch = RouteData.createWithQuery(
  PathDataBuilder.create().const("topics").const("s").const("search"),
  query => {
    const title = RouteData.encodeOne(query["title"]);
    const tags = RouteData.encodeArray(query["tags"]);
    const dead = RouteData.encodeOne(query["dead"]);

    return {
      title: title !== undefined ? title : "",
      tags,
      dead: dead === "true",
    };
  },
  query => {
    const result: Record<string, string | ReadonlyArray<string>> = {};
    if (query.title !== undefined && query.title.length !== 0) {
      result["title"] = query.title;
    }

    if (query.tags !== undefined && query.tags.length !== 0) {
      result["tags"] = query.tags;
    }

    if (query.dead !== undefined && query.dead) {
      result["dead"] = "true";
    }

    return result;
  },
);
export const topicCreate = RouteData.create(
  PathDataBuilder.create().const("topics").const("s").const("create"),
);
export const topic = RouteData.create(
  PathDataBuilder.create().const("topics").variable("id"),
);
export const topicData = RouteData.create(
  PathDataBuilder.create().const("topics").variable("id").const("details"),
);
export const topicFork = RouteData.create(
  PathDataBuilder.create().const("topics").variable("id").const("fork"),
);
export const topicEdit = RouteData.create(
  PathDataBuilder.create().const("topics").variable("id").const("edit"),
);
export const profiles = RouteData.create(
  PathDataBuilder.create().const("user").const("profiles"),
);
export const profileCreate = RouteData.create(
  PathDataBuilder.create().const("profiles").const("s").const("create"),
);
export const profile = RouteData.create(
  PathDataBuilder.create().const("profiles").variable("id"),
);
export const profileEdit = RouteData.create(
  PathDataBuilder.create().const("profiles").variable("id").const("edit"),
);
export const notifications = RouteData.create(
  PathDataBuilder.create().const("notifications"),
);
export const messages = RouteData.create(
  PathDataBuilder.create().const("messages"),
);
export const signup = RouteData.create(
  PathDataBuilder.create().const("signup"),
);
export const login = RouteData.create(PathDataBuilder.create().const("login"));
export const auth = RouteData.createWithQuery(
  PathDataBuilder.create().const("auth"),
  query => {
    const id = RouteData.encodeOne(query["client"]);

    return {
      id: id,
    };
  },
  query => {
    const result: Record<string, string | ReadonlyArray<string>> = {};
    if (query.id !== undefined) {
      result["client"] = query.id;
    }

    return result;
  },
);
export const settings = RouteData.create(
  PathDataBuilder.create().const("settings"),
);
export const accountSetting = RouteData.create(
  PathDataBuilder.create().const("settings").const("account"),
);
export const appsSetting = RouteData.create(
  PathDataBuilder.create().const("settings").const("apps"),
);
export const devSetting = RouteData.create(
  PathDataBuilder.create().const("settings").const("dev"),
);
