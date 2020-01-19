package com.anontown.entities.res

import cats._, cats.implicits._, cats.derived._

final case class ResTopicId(value: String) extends AnyVal;

object ResTopicId {
  implicit val eqImpl: Eq[ResTopicId] = {
    import auto.eq._
    semi.eq
  }

  implicit val resIdImpl = new ResId[ResTopicId] {
    def value(self: Self) = self.value;
  }
}
