import Redis from "ioredis";
import lazy = require("lazy-value");
import { Config } from "./config";

export function createRedisClient() {
  return new Redis(`redis://${Config.redis.host}/0`);
}

export const RedisClient = lazy(() => createRedisClient());
