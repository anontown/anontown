package com.anontown.entities.topic

import cats._, cats.implicits._, cats.derived._

final case class TopicTitle(value: String) extends AnyVal;
object TopicTitle {
  implicit val eqImpl: Eq[TopicTitle] = {
    import auto.eq._
    semi.eq
  }
}
