package com.anontown.entities.topic

import cats._, cats.implicits._, cats.derived._

final case class TopicForkId(value: String) extends AnyVal;
object TopicForkId {
  implicit val eqImpl: Eq[TopicForkId] = {
    import auto.eq._
    semi.eq
  }

  implicit val topicIdImpl = new TopicTemporaryId[TopicForkId] {
    def value(self: Self) = self.value
  }
}
