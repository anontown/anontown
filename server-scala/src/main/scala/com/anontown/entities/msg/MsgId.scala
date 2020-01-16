package com.anontown.entities.msg

import cats._, cats.implicits._, cats.derived._

final case class MsgId(value: String) extends AnyVal;

object MsgId {
  implicit val eqImpl: Eq[MsgId] = {
    import auto.eq._
    semi.eq
  }
}
