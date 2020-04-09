import * as es from "elasticsearch";
import Redis from "ioredis";
import lazy = require("lazy-value");
import { MongoClient } from "mongodb";
import { Config } from "./config";
import { logger } from "./logger";

export const Mongo = lazy(async () => {
  const db = await MongoClient.connect(
    `mongodb://${Config.mongo.host}/anontown`,
    {
      useNewUrlParser: true,
    },
  );
  logger.info("db:connect");
  return db.db();
});

export const ESClient = lazy(
  () =>
    new es.Client({
      host: `http://${Config.es.host}`,
      log: "error",
      apiVersion: "6.8",
    }),
);

export function createRedisClient() {
  return new Redis(`redis://${Config.redis.host}/0`);
}

export const RedisClient = lazy(() => createRedisClient());
