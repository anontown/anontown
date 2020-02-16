package com.anontown.entities.topic

import cats.Eq
import cats.implicits._
import com.anontown.entities.topic.TopicId.ops._

final case class AnyTopicId(value: String);

object AnyTopicId {
  def fromTopicId[A: TopicId](x: A): AnyTopicId = AnyTopicId(x.value)

  implicit val implTopicId = new TopicId[AnyTopicId] {
    def value(self: Self) = self.value
  }

  implicit val implEq = new Eq[AnyTopicId] {
    def eqv(x: AnyTopicId, y: AnyTopicId): Boolean = {
      x.value === y.value
    }
  }
}
