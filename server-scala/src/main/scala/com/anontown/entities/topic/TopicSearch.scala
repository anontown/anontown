package com.anontown.entities.topic

import simulacrum._

trait TopicSearchAPI extends TopicAPI {
  val tags: List[String];
  val text: String;
}

@typeclass
trait TopicSearch[A] extends Topic[A] {
  type IdType <: TopicSearchId;
  // see: https://github.com/typelevel/simulacrum/issues/55
  type SelfApplyLens0[T] = SelfApplyLens[T]

  def tags(self: A): SelfApplyLens0[TopicTags];
  def text(self: A): SelfApplyLens0[TopicText];
}
