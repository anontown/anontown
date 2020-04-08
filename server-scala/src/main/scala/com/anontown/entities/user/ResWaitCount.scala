package com.anontown.entities.user

import cats._, cats.implicits._, cats.derived._

sealed trait ResWaitCountKey;

object ResWaitCountKey {
  implicit val implEq: Eq[ResWaitCountKey] = {
    import auto.eq._
    semi.eq
  }

  final case class M10() extends ResWaitCountKey;
  final case class M30() extends ResWaitCountKey;
  final case class H1() extends ResWaitCountKey;
  final case class H6() extends ResWaitCountKey;
  final case class H12() extends ResWaitCountKey;
  final case class D1() extends ResWaitCountKey;
}

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
