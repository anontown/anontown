package com.anontown.entities.topic

import cats._, cats.implicits._, cats.derived._
import com.anontown.utils.Impl._;
import java.time.OffsetDateTime

final case class TopicForkAPI(
    id: String,
    title: String,
    update: String,
    date: String,
    resCount: Int,
    active: Boolean,
    parentID: String
) extends TopicAPI;

object TopicForkAPI {
  implicit val eqImpl: Eq[TopicForkAPI] = {
    import auto.eq._
    semi.eq
  }
}
final case class TopicFork(
    id: TopicForkId,
    title: TopicTitle,
    update: OffsetDateTime,
    date: OffsetDateTime,
    resCount: Int,
    ageUpdate: OffsetDateTime,
    active: Boolean,
    parent: TopicNormalId
) extends Topic
    with TopicTemporary {
  type IdType = TopicForkId;
}

object TopicFork {
  implicit val eqImpl: Eq[TopicFork] = {
    import auto.eq._
    semi.eq
  }
}
