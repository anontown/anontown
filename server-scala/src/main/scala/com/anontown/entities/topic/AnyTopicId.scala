package com.anontown.entities.topic

import cats.Eq
import cats.implicits._
import com.anontown.entities.topic.TopicId.ops._

trait AnyTopicId {
  type TopicIdType;

  val topicId: TopicIdType;
  val implTopicId: TopicId[TopicIdType];
}

object AnyTopicId {
  def apply[TopicIdArg: TopicId](
      x: TopicIdArg
  ): AnyTopicId = {
    new AnyTopicId {
      type TopicIdType = TopicIdArg
      val topicId = x
      val implTopicId = implicitly
    }
  }

  implicit val implTopicId = new TopicId[AnyTopicId] {
    def value(self: Self) = self.implTopicId.value(self.topicId)
  }

  implicit val implEq = new Eq[AnyTopicId] {
    def eqv(x: AnyTopicId, y: AnyTopicId): Boolean = {
      x.value === y.value
    }
  }
}
