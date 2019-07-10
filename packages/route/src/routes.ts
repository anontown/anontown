import { PathDataBuilder, RouteData } from "./route-data";
import * as qs from "query-string";

export const Home = RouteData.create(PathDataBuilder.create().const(""));
export const Res = RouteData.create(
  PathDataBuilder.create()
    .const("res")
    .variable("id")
);
export const ResReply = RouteData.create(
  PathDataBuilder.create()
    .const("res")
    .variable("id")
    .const("reply")
);
export const ResHash = RouteData.create(
  PathDataBuilder.create()
    .const("hash")
    .variable("hash")
);

export const TopicSearch = RouteData.createWithQuery(
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
    if (query.title.length !== 0) {
      res["title"] = query.title;
    }

    if (query.tags.length !== 0) {
      res["tags"] = query.tags;
    }

    if (query.dead) {
      res["dead"] = "true";
    }

    return res;
  }
);
