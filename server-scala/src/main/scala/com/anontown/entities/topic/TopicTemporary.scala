package com.anontown.entities.topic

import simulacrum._

@typeclass
trait TopicTemporary[A] extends Topic[A] {
  implicit val topicIdImplIdType: TopicTemporaryId[IdType];
}
