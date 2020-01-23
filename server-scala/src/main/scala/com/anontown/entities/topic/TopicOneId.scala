package com.anontown.entities.topic

import cats._, cats.implicits._, cats.derived._

final case class TopicOneId(value: String) extends AnyVal;
object TopicOneId {
  implicit val eqImpl: Eq[TopicOneId] = {
    import auto.eq._
    semi.eq
  }

  implicit val topicIdImpl = new TopicId[TopicOneId]
  with TopicSearchId[TopicOneId] with TopicTemporaryId[TopicOneId] {
    def value(self: Self) = self.value
  }
}
