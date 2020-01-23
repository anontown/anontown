package com.anontown.entities.res

import cats._, cats.implicits._, cats.derived._

final case class ResForkId(value: String) extends AnyVal;

object ResForkId {
  implicit val implEq: Eq[ResForkId] = {
    import auto.eq._
    semi.eq
  }

  implicit val resIdImpl = new ResId[ResForkId] {
    def value(self: Self) = self.value;
  }
}
