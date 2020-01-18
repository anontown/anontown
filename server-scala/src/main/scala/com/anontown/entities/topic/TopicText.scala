package com.anontown.entities.topic

import cats._, cats.implicits._, cats.derived._

final case class TopicText(value: String) extends AnyVal;
object TopicText {
  implicit val eqImpl: Eq[TopicText] = {
    import auto.eq._
    semi.eq
  }
}
