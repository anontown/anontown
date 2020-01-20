package com.anontown.entities.topic

import simulacrum._

@typeclass
trait TopicTemporary[A] extends Topic[A] {
  val topicIdImplIdType: TopicTemporaryId[IdType];
}
