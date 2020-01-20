package com.anontown.entities.topic

import cats._, cats.implicits._, cats.derived._

final case class TopicOneId(value: String) extends AnyVal;
object TopicOneId {
  implicit val eqImpl: Eq[TopicOneId] = {
    import auto.eq._
    semi.eq
  }

  implicit val topicIdImpl = new TopicSearchId[TopicNormalId]
  with TopicTemporaryId[TopicNormalId] {
    def value(self: Self) = self.value
  }
}
