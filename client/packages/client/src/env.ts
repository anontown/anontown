import * as env from "@anontown/common/dist/env";

declare const __ENV__: env.Env;
declare const __BUILD_DATE__: number;
declare const __MODE__: string;
declare const __ENABLE_BFF__: boolean;

export const BUILD_DATE = __BUILD_DATE__;

export const Env = __ENV__;
export const Mode = __MODE__;
export const EnableBff = __ENABLE_BFF__;
