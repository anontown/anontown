package com.anontown.entities.topic

import cats._, cats.implicits._, cats.derived._

final case class TopicTags(value: List[TopicTag]) extends AnyVal;
object TopicTags {
  implicit val implEq: Eq[TopicTags] = {
    import auto.eq._
    semi.eq
  }
}
