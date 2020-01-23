package com.anontown.entities.user

import java.time.OffsetDateTime;
import cats._, cats.derived._
import com.anontown.utils.Impl._;

final case class ResWait(last: OffsetDateTime, count: ResWaitCount);

object ResWait {
  implicit val implEq: Eq[ResWait] = {
    import auto.eq._
    semi.eq
  }
}
