package com.anontown.entities.res

import cats._, cats.implicits._, cats.derived._

final case class ResNormalId(value: String) extends AnyVal with ResId;

object ResNormalId {
  implicit val eqImpl: Eq[ResNormalId] = {
    import auto.eq._
    semi.eq
  }
}
