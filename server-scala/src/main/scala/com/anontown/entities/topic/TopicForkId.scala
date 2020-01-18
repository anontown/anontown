package com.anontown.entities.topic

import cats._, cats.implicits._, cats.derived._

final case class TopicForkId(value: String) extends AnyVal with TopicTemporaryId;
object TopicForkId {
  implicit val eqImpl: Eq[TopicForkId] = {
    import auto.eq._
    semi.eq
  }
}
