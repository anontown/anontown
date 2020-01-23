package com.anontown.entities.res

import cats._, cats.derived._

sealed trait VoteType;

object VoteType {
  implicit val implEq: Eq[VoteType] = {
    import auto.eq._
    semi.eq
  }

  final case class Uv() extends VoteType;
  final case class Dv() extends VoteType;
}
