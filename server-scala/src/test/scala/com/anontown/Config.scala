package com.anontown

object ConfigFixtures {
  val config: Config = Config(
    timezone = "Asia/Tokyo",
    saveDir = "../../",
    server = ServerConfig(port = 8080),
    mongo = MongoConfig(host = "mongo:27017"),
    es = EsConfig(host = "es:9200"),
    redis = RedisConfig(host = "redis:6379"),
    salt = SaltConfig(
      pass = "aaa",
      hash = "bbb",
      token = "ccc",
      tokenReq = "ddd"
    ),
    recaptcha = RecaptchaConfig(
      siteKey = "xxxxxxxxxxxx",
      secretKey = "xxxxxxxxxxx"
    )
  )
}
