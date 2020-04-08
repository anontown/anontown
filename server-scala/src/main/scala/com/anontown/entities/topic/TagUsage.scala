package com.anontown.entities.topic

import cats._, cats.implicits._, cats.derived._

final case class TagUsageAPI(name: String, count: Int);
object TagUsageAPI {
  implicit val implEq: Eq[TagUsageAPI] = {
    import auto.eq._
    semi.eq
  }
}

final case class TagUsage(
    name: String,
    count: Int
);

object TagUsage {
  implicit class TagUsageService(val value: TagUsage) {
    def toAPI(): TagUsageAPI = {
      TagUsageAPI(name = value.name, count = value.count)
    }
  }
}
