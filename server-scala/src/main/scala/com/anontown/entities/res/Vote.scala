package com.anontown.entities.res

import cats._, cats.implicits._, cats.derived._
import com.anontown.entities.user.{UserId, User}

final case class Vote(user: UserId, value: Int);

object Vote {
  implicit val eqImpl: Eq[Vote] = {
    import auto.eq._
    semi.eq
  }
}
