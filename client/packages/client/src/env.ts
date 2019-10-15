import { Env as EnvType } from "@anontown/client-types";

declare var __ENV__: EnvType;
declare var __BUILD_DATE__: number;

export const BUILD_DATE = __BUILD_DATE__;

export const Env = __ENV__;
