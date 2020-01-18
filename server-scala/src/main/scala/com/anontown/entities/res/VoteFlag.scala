package com.anontown.entities.res

import cats._, cats.derived._

sealed trait VoteFlag;
object VoteFlag {
  final case class Uv() extends VoteFlag;
  final case class Dv() extends VoteFlag;
  final case class Not() extends VoteFlag;

  implicit val eqImpl: Eq[VoteFlag] = {
    import auto.eq._
    semi.eq
  }
}
