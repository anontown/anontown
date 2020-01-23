package com.anontown.entities.topic

import cats._, cats.implicits._, cats.derived._

final case class TopicTag(value: String) extends AnyVal;
object TopicTag {
  implicit val implEq: Eq[TopicTag] = {
    import auto.eq._
    semi.eq
  }
}
