package com.anontown.entities.res

import cats._, cats.implicits._, cats.derived._
import com.anontown.entities.user.UserId

final case class Vote(user: UserId, value: Int);

object Vote {
  implicit val implEq: Eq[Vote] = {
    import auto.eq._
    semi.eq
  }
}
