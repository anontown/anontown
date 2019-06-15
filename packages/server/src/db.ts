import * as es from "elasticsearch";
import * as Redis from "ioredis";
import lazy = require("lazy-value");
import { MongoClient } from "mongodb";
import { Config } from "./config";
import { Logger } from "./logger";

export const DB = lazy((async () => {
    const db = await MongoClient.connect(Config.db.url, { useNewUrlParser: true });
    Logger.system.info("db:connect");
    return db.db();
}));

export const ESClient = lazy(() => new es.Client({ host: "http://" + Config.es.host, log: "error" }));

export function createRedisClient() {
    return new Redis(Config.redis.url);
}

export const RedisClient = createRedisClient();
