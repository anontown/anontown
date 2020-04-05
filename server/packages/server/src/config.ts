export const Config = {
  timezone: "Asia/Tokyo",
  server: {
    port: Number(process.env.SERVER_PORT),
  },
  mongo: {
    host: process.env.MONGO_HOST as string,
  },
  es: {
    host: process.env.ES_HOST as string,
  },
  redis: {
    host: process.env.REDIS_HOST as string,
  },
  salt: {
    pass: process.env.SALT_PASS as string,
    hash: process.env.SALT_HASH as string,
    token: process.env.SALT_TOKEN as string,
    tokenReq: process.env.SALT_TOKEN_REQ as string,
  },
  recaptcha: {
    siteKey: process.env.RECAPTCHA_SITE_KET as string,
    secretKey: process.env.RECAPTCHA_SECRET_KET as string,
  },
};
