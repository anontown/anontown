package com.anontown.entities.user

import cats._, cats.derived._
import com.anontown.entities.DateTime

final case class ResWait(last: DateTime, count: ResWaitCount);

object ResWait {
  implicit val implEq: Eq[ResWait] = {
    import auto.eq._
    semi.eq
  }
}
