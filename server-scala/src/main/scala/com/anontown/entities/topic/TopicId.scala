package com.anontown.entities.topic

import simulacrum._

@typeclass
trait TopicId[A] {
  type Self = A;

  def value(self: A): String;
}
