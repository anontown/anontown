package com.anontown.entities.topic

import simulacrum._
import shapeless._
import record._
import com.anontown.utils.Record._
import com.anontown.AuthToken
import TopicSearch.ops._

trait TopicSearchAPI extends TopicAPI {
  val tags: List[String];
  val text: String;
}

@typeclass
trait TopicSearch[A] extends Topic[A] {
  val implTopicIdForIdType: TopicSearchId[IdType];
  // see: https://github.com/typelevel/simulacrum/issues/55
  type SelfApplyLens0[T] = SelfApplyLens[T]

  type API <: TopicSearchAPI;

  def tags(self: A): SelfApplyLens0[TopicTags];
  def text(self: A): SelfApplyLens0[TopicText];
}

object TopicSearch {
  implicit class TopicSearchService[A](val self: A)(
      implicit val implTopicSearch: TopicSearch[A]
  ) {
    type TopicSearchAPIIntrinsicProperty =
      ("tags" ->> List[String]) ::
        ("text" ->> String) ::
        HNil

    def topicSearchAPIIntrinsicProperty(
        authToken: Option[AuthToken]
    ): TopicSearchAPIIntrinsicProperty = {
      Record(
        tags = self.tags.get.value.map(_.value),
        text = self.text.get.value
      )
    }
  }
}
