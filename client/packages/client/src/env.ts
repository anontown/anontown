import * as env from "@anontown/common/lib/env";

declare const __ENV__: env.Env | undefined;
declare const __RAW_ENV__: Record<string, string | undefined> | undefined;
declare const __BUILD_DATE__: number;
declare const __MODE__: string;
declare const __ENABLE_BFF__: boolean;

export const BUILD_DATE = __BUILD_DATE__;

export const Env =
  typeof __ENV__ !== "undefined"
    ? __ENV__
    : env.loadEnv(typeof __RAW_ENV__ !== "undefined" ? __RAW_ENV__ : {});
export const Mode = __MODE__;
export const EnableBff = __ENABLE_BFF__;
