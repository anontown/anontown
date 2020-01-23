package com.anontown.entities.res

import cats._, cats.implicits._, cats.derived._

final case class ResNormalId(value: String) extends AnyVal;

object ResNormalId {
  implicit val implEq: Eq[ResNormalId] = {
    import auto.eq._
    semi.eq
  }

  implicit val implResId = new ResId[ResNormalId] {
    def value(self: Self) = self.value;
  }
}
