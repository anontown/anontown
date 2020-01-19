package com.anontown.entities.token

import cats._, cats.implicits._, cats.derived._

final case class TokenGeneralId(value: String) extends AnyVal;

object TokenGeneralId {
  implicit val eqImpl: Eq[TokenGeneralId] = {
    import auto.eq._
    semi.eq
  }

  implicit val tokenIdImpl = new TokenId[TokenGeneralId] {
    def value(self: Self) = self.value
  }
}
