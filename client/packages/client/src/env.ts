export interface Env {
  client: {
    origin: string;
  };
  camo: {
    origin: string;
    key: string;
  };
  api: {
    origin: string;
  };
  socket: {
    origin: string;
  };
  recaptcha: {
    siteKey: string;
  };
  imgur: {
    clientID: string;
  };
  ga: {
    id: string;
  } | null;
}

declare var __ENV__: Env;
declare var __BUILD_DATE__: number;

export const BUILD_DATE = __BUILD_DATE__;

export const Env = __ENV__;
