import { Env as JSEnv, loadEnv } from "@anontown/common/dist/env";

export interface Env {
  jsEnv: JSEnv;
  port: number;
}

export const env: Env = {
  jsEnv: loadEnv(process.env),
  port: Number(process.env["PORT"]),
};
