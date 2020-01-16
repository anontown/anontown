package com.anontown.entities.history

import cats._, cats.implicits._, cats.derived._

final case class HistoryId(value: String) extends AnyVal;

object HistoryId {
  implicit val eqImpl: Eq[HistoryId] = {
    import auto.eq._
    semi.eq
  }
}
