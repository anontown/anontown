package com.anontown.entities.res

import cats._, cats.derived._
import com.anontown.entities.user.UserId

final case class Reply[+RId <: ResId](
    res: RId,
    user: UserId
);

object Reply {
  implicit def eqImpl[RId <: ResId](implicit ridEq: Eq[RId]): Eq[Reply[RId]] = {
    import auto.eq._
    semi.eq
  }
}
