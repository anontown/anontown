import { Env as EnvType } from "@anontown/common/dist/env";

declare const __ENV__: EnvType;
declare const __BUILD_DATE__: number;
declare const __MODE__: string;

export const BUILD_DATE = __BUILD_DATE__;

export const Env = __ENV__;
export const Mode = __MODE__;
