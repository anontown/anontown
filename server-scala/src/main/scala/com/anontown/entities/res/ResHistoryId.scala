package com.anontown.entities.res

import cats._, cats.implicits._, cats.derived._

final case class ResHistoryId(value: String) extends AnyVal;

object ResHistoryId {
  implicit val implEq: Eq[ResHistoryId] = {
    import auto.eq._
    semi.eq
  }

  implicit val resIdImpl = new ResId[ResHistoryId] {
    def value(self: Self) = self.value;
  }
}
