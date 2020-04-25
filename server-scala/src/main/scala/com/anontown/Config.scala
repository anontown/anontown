package com.anontown;

import java.time.ZoneId

final case class Config(
    timezone: ZoneId,
    server: ServerConfig,
    mongo: MongoConfig,
    es: EsConfig,
    redis: RedisConfig,
    salt: SaltConfig,
    recaptcha: RecaptchaConfig
);
final case class ServerConfig(port: Int);
final case class MongoConfig(host: String);
final case class EsConfig(host: String);
final case class RedisConfig(host: String);
final case class SaltConfig(
    pass: String,
    hash: String,
    token: String,
    tokenReq: String
);
final case class RecaptchaConfig(siteKey: String, secretKey: String);

object ServerConfig {
  def fromEnv(env: Map[String, String]): Option[ServerConfig] = {
    for {
      port <- env.get("SERVER_PORT").flatMap(_.toIntOption)
    } yield ServerConfig(port = port)
  }
}

object MongoConfig {
  def fromEnv(env: Map[String, String]): Option[MongoConfig] = {
    for {
      host <- env.get("MONGO_HOST")
    } yield MongoConfig(host = host)
  }
}

object EsConfig {
  def fromEnv(env: Map[String, String]): Option[EsConfig] = {
    for {
      host <- env.get("ES_HOST")
    } yield EsConfig(host = host)
  }
}

object RedisConfig {
  def fromEnv(env: Map[String, String]): Option[RedisConfig] = {
    for {
      host <- env.get("REDIS_HOST")
    } yield RedisConfig(host = host)
  }
}

object SaltConfig {
  def fromEnv(env: Map[String, String]): Option[SaltConfig] = {
    for {
      pass <- env.get("SALT_PASS")
      hash <- env.get("SALT_HASH")
      token <- env.get("SALT_TOKEN")
      tokenReq <- env.get("SALT_TOKEN_REQ")
    } yield SaltConfig(
      pass = pass,
      hash = hash,
      token = token,
      tokenReq = tokenReq
    )
  }
}

object RecaptchaConfig {
  def fromEnv(env: Map[String, String]): Option[RecaptchaConfig] = {
    for {
      siteKey <- env.get("RECAPTCHA_SITE_KET")
      secretKey <- env.get("RECAPTCHA_SECRET_KET")
    } yield RecaptchaConfig(
      siteKey = siteKey,
      secretKey = secretKey
    )
  }
}

object Config {
  lazy val config: Config = Config.create()

  def fromEnv(env: Map[String, String]): Option[Config] = {
    for {
      server <- ServerConfig.fromEnv(env)
      mongo <- MongoConfig.fromEnv(env)
      es <- EsConfig.fromEnv(env)
      redis <- RedisConfig.fromEnv(env)
      salt <- SaltConfig.fromEnv(env)
      recaptcha <- RecaptchaConfig.fromEnv(env)
    } yield Config(
      timezone = ZoneId.of("Asia/Tokyo"),
      server = server,
      mongo = mongo,
      es = es,
      redis = redis,
      salt = salt,
      recaptcha = recaptcha
    )
  }

  @SuppressWarnings(Array("org.wartremover.warts.OptionPartial"))
  def create(): Config = {
    import scala.collection.JavaConverters._

    Config
      .fromEnv(Map(System.getenv().asScala.map(x => (x._1, x._2)).toList: _*))
      .get
  }
}
