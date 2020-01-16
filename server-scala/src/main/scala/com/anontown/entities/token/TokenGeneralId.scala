package com.anontown.entities.token

import cats._, cats.implicits._, cats.derived._

final case class TokenGeneralId(value: String) extends TokenId

object TokenGeneralId {
  implicit val eqImpl: Eq[TokenGeneralId] = {
    import auto.eq._
    semi.eq
  }
}
