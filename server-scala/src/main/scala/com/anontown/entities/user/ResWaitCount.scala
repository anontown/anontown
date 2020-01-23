package com.anontown.entities.user

import cats._, cats.implicits._, cats.derived._

final case class ResWaitCount(
    m10: Int,
    m30: Int,
    h1: Int,
    h6: Int,
    h12: Int,
    d1: Int
);

object ResWaitCount {
  implicit val implEq: Eq[ResWaitCount] = {
    import auto.eq._
    semi.eq
  }
}
