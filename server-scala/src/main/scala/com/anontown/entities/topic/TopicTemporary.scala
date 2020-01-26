package com.anontown.entities.topic

import simulacrum._
import shapeless._
import record._
import com.anontown.utils.Record._
import com.anontown.AuthToken

trait TopicTemporaryAPI extends TopicAPI {}

@typeclass
trait TopicTemporary[A] extends Topic[A] {
  implicit val implTopicIdForIdType: TopicTemporaryId[IdType];

  type API <: TopicTemporaryAPI;
}

object TopicTemporary {
  implicit class TopicTemporaryService[A](val self: A)(
      implicit val implTopicTemporary: TopicTemporary[A]
  ) {
    type TopicTemporaryAPIIntrinsicProperty = HNil

    def topicTemporaryAPIIntrinsicProperty(
        authToken: Option[AuthToken]
    ): TopicTemporaryAPIIntrinsicProperty = {
      Record()
    }
  }
}
