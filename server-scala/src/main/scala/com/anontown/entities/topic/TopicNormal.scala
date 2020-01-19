package com.anontown.entities.topic

import cats._, cats.implicits._, cats.derived._
import com.anontown.utils.Impl._;
import java.time.OffsetDateTime

final case class TopicNormalAPI(
    id: String,
    title: String,
    update: String,
    date: String,
    resCount: Int,
    active: Boolean,
    tags: List[String],
    text: String
) extends TopicSearchAPI;

object TopicNormalAPI {
  implicit val eqImpl: Eq[TopicNormalAPI] = {
    import auto.eq._
    semi.eq
  }
}
final case class TopicNormal(
    id: TopicNormalId,
    title: TopicTitle,
    update: OffsetDateTime,
    date: OffsetDateTime,
    resCount: Int,
    ageUpdate: OffsetDateTime,
    active: Boolean,
    tags: TopicTags,
    text: TopicText
) extends TopicSearch {
  type IdType = TopicNormalId;
}

object TopicNormal {
  implicit val eqImpl: Eq[TopicNormal] = {
    import auto.eq._
    semi.eq
  }
}
