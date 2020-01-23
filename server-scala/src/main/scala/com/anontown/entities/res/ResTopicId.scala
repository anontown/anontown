package com.anontown.entities.res

import cats._, cats.implicits._, cats.derived._

final case class ResTopicId(value: String) extends AnyVal;

object ResTopicId {
  implicit val implEq: Eq[ResTopicId] = {
    import auto.eq._
    semi.eq
  }

  implicit val implResId = new ResId[ResTopicId] {
    def value(self: Self) = self.value;
  }
}
