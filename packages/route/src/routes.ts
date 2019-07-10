import { RouteDataBuilder, queryArray, queryOne } from "./route-data";
import * as t from "io-ts";

export const Home = RouteDataBuilder.fromPath("/").value;
export const Res = RouteDataBuilder.fromPath("/res/:id").params(
  t.type({ id: t.string })
).value;
export const ResReply = RouteDataBuilder.fromPath("/res/:id/reply").params(
  t.type({ id: t.string })
).value;
export const ResHash = RouteDataBuilder.fromPath("/hash/:hash").params(
  t.type({ hash: t.string })
).value;
export const TopicSearch = RouteDataBuilder.fromPath("/topic/search").query(
  t.partial({
    title: queryOne(t.string),
    tags: queryArray(t.string),
    dead: queryOne(t.string)
  })
).value;
