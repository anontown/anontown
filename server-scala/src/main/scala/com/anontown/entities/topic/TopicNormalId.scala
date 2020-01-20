package com.anontown.entities.topic

import cats._, cats.implicits._, cats.derived._

final case class TopicNormalId(value: String) extends AnyVal;
object TopicNormalId {
  implicit val eqImpl: Eq[TopicNormalId] = {
    import auto.eq._
    semi.eq
  }

  implicit val topicIdImpl = new TopicSearchId[TopicNormalId] {
    def value(self: Self) = self.value
  }
}
