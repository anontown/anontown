package com.anontown.entities.res

import cats._, cats.implicits._, cats.derived._
import ResId.ops._

final case class AnyResId(value: String) extends AnyVal;

object AnyResId {
  def fromResId[A: ResId](x: A): AnyResId = AnyResId(x.value)

  implicit val implEq: Eq[AnyResId] = {
    import auto.eq._
    semi.eq
  }

  implicit val implResId = new ResId[AnyResId] {
    def value(self: Self) = self.value;
  }
}
