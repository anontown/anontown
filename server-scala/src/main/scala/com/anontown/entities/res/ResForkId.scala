package com.anontown.entities.res

import cats._, cats.implicits._, cats.derived._

final case class ResForkId(value: String) extends AnyVal with ResId;

object ResForkId {
  implicit val eqImpl: Eq[ResForkId] = {
    import auto.eq._
    semi.eq
  }
}
