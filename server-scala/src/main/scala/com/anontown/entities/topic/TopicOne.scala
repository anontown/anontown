package com.anontown.entities.topic

import cats._, cats.implicits._, cats.derived._
import com.anontown.utils.Impl._;
import java.time.OffsetDateTime

final case class TopicOneAPI(
    id: String,
    title: String,
    update: String,
    date: String,
    resCount: Int,
    active: Boolean,
    tags: List[String],
    text: String
) extends TopicSearchAPI;

object TopicOneAPI {
  implicit val eqImpl: Eq[TopicOneAPI] = {
    import auto.eq._
    semi.eq
  }
}
final case class TopicOne(
    id: TopicOneId,
    title: TopicTitle,
    update: OffsetDateTime,
    date: OffsetDateTime,
    resCount: Int,
    ageUpdate: OffsetDateTime,
    active: Boolean,
    tags: TopicTags,
    text: TopicText
) extends TopicSearch
    with TopicTemporary {
  type Id = TopicOneId;
}

object TopicOne {
  implicit val eqImpl: Eq[TopicOne] = {
    import auto.eq._
    semi.eq
  }
}
