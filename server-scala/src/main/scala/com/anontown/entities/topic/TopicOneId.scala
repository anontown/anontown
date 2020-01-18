package com.anontown.entities.topic

import cats._, cats.implicits._, cats.derived._

final case class TopicOneId(value: String)
    extends AnyVal
    with TopicSearchId
    with TopicTemporaryId;
object TopicOneId {
  implicit val eqImpl: Eq[TopicOneId] = {
    import auto.eq._
    semi.eq
  }
}
