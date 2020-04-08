package com.anontown.entities.token

import cats._, cats.implicits._, cats.derived._
import com.anontown.entities.DateTime

final case class TokenReq(
    key: String,
    expireDate: DateTime,
    active: Boolean
);

object TokenReq {
  implicit val implEq: Eq[TokenReq] = {
    import auto.eq._
    semi.eq
  }
}

final case class TokenReqAPI(token: String, key: String)

object TokenReqAPI {
  implicit val implEq: Eq[TokenReqAPI] = {
    import auto.eq._
    semi.eq
  }
}
