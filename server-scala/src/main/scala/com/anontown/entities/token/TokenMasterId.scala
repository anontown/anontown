package com.anontown.entities.token

import cats._, cats.implicits._, cats.derived._

final case class TokenMasterId(value: String) extends AnyVal

object TokenMasterId {
  implicit val eqImpl: Eq[TokenMasterId] = {
    import auto.eq._
    semi.eq
  }

  implicit val tokenIdImpl = new TokenId[TokenMasterId] {
    def value(self: Self) = self.value
  }
}
