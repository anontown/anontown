package com.anontown.entities.res

import cats._, cats.derived._
import com.anontown.entities.user.UserId

final case class Reply[+ResIdType: ResId](
    res: ResIdType,
    user: UserId
);

object Reply {
  implicit def eqImpl[ResIdType: ResId: Eq]: Eq[Reply[ResIdType]] = {
    import auto.eq._
    semi.eq
  }
}
