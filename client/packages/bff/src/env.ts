import { Env as JSEnv } from "@anontown/client-types";

export interface Env {
  jsEnv: JSEnv;
  port: number;
}

export const env: Env = {
  jsEnv: {
    client: {
      origin: process.env["CLIENT_ORIGIN"]!
    },
    camo: {
      origin: process.env["CAMO_ORIGIN"]!,
      key: process.env["CAMO_KEY"]!
    },
    api: {
      origin: process.env["API_ORIGIN"]!
    },
    socket: {
      origin: process.env["SOCKET_ORIGIN"]!
    },
    recaptcha: {
      siteKey: process.env["RECAPTCHA_SITE_KET"]!
    },
    imgur: {
      clientID: process.env["IMGUR_CLIENT_ID"]!
    },
    ga: process.env["IMGUR_CLIENT_ID"]
      ? { id: process.env["IMGUR_CLIENT_ID"] }
      : null
  },
  port: Number(process.env["PORT"])
};
