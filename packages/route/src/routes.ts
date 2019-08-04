import { PathDataBuilder, RouteData } from "./route-data";
import * as qs from "query-string";

export const home = RouteData.create(PathDataBuilder.create().const(""));
export const res = RouteData.create(
  PathDataBuilder.create()
    .const("res")
    .variable("id")
);
export const resReply = RouteData.create(
  PathDataBuilder.create()
    .const("res")
    .variable("id")
    .const("reply")
);
export const hash = RouteData.create(
  PathDataBuilder.create()
    .const("hash")
    .variable("hash")
);
export const topicSearch = RouteData.createWithQuery(
  PathDataBuilder.create()
    .const("topic")
    .const("search"),
  query => {
    const title = RouteData.encodeOne(query["title"]);
    const tags = RouteData.encodeArray(query["tags"]);
    const dead = RouteData.encodeOne(query["dead"]);

    return {
      title: title !== undefined ? title : "",
      tags,
      dead: dead === "true"
    };
  },
  query => {
    const res: qs.ParsedQuery = {};
    if (query.title !== undefined && query.title.length !== 0) {
      res["title"] = query.title;
    }

    if (query.tags !== undefined && query.tags.length !== 0) {
      res["tags"] = query.tags;
    }

    if (query.dead !== undefined && query.dead) {
      res["dead"] = "true";
    }

    return res;
  }
);
export const topicCreate = RouteData.create(
  PathDataBuilder.create()
    .const("topic")
    .const("create")
);
export const topic = RouteData.create(
  PathDataBuilder.create()
    .const("topic")
    .variable("id")
);
export const topicData = RouteData.create(
  PathDataBuilder.create()
    .const("topic")
    .variable("id")
    .const("data")
);
export const topicFork = RouteData.create(
  PathDataBuilder.create()
    .const("topic")
    .variable("id")
    .const("fork")
);
export const topicEdit = RouteData.create(
  PathDataBuilder.create()
    .const("topic")
    .variable("id")
    .const("edit")
);
export const profiles = RouteData.create(
  PathDataBuilder.create().const("profiles")
);
export const profileEdit = RouteData.create(
  PathDataBuilder.create()
    .const("profiles")
    .variable("id")
);
export const notifications = RouteData.create(
  PathDataBuilder.create().const("notifications")
);
export const messages = RouteData.create(
  PathDataBuilder.create().const("messages")
);
export const signup = RouteData.create(
  PathDataBuilder.create().const("signup")
);
export const login = RouteData.create(PathDataBuilder.create().const("login"));
export const auth = RouteData.createWithQuery(
  PathDataBuilder.create().const("auth"),
  query => {
    const id = RouteData.encodeOne(query["client"]);

    return {
      id: id
    };
  },
  query => {
    const res: qs.ParsedQuery = {};
    if (query.id !== undefined) {
      res["client"] = query.id;
    }

    return res;
  }
);
export const settings = RouteData.create(
  PathDataBuilder.create().const("settings")
);
export const accountSetting = RouteData.create(
  PathDataBuilder.create()
    .const("settings")
    .const("account")
);
export const appsSetting = RouteData.create(
  PathDataBuilder.create()
    .const("settings")
    .const("apps")
);
export const devSetting = RouteData.create(
  PathDataBuilder.create()
    .const("settings")
    .const("dev")
);
export const profile = RouteData.create(
  PathDataBuilder.create()
    .const("profile")
    .variable("id")
);
