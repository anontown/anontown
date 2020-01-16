package com.anontown.entities.res

import cats._, cats.implicits._, cats.derived._

final case class ResHistoryId(value: String) extends AnyVal with ResId;

object ResHistoryId {
  implicit val eqImpl: Eq[ResHistoryId] = {
    import auto.eq._
    semi.eq
  }
}
