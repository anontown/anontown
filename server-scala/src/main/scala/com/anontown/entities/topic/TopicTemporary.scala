package com.anontown.entities.topic

import simulacrum._

@typeclass
trait TopicTemporary[A] extends Topic[A] {
  type IdType <: TopicTemporaryId;
}
