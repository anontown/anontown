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
}

declare var __ENV__: Env;
declare var __BUILD_DATE__: number;

export const BUILD_DATE = __BUILD_DATE__;

export const Config = __ENV__;

export const gaID = "UA-108693999-1";
