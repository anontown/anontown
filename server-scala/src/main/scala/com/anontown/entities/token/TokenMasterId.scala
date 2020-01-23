package com.anontown.entities.token

import cats._, cats.implicits._, cats.derived._

final case class TokenMasterId(value: String) extends AnyVal

object TokenMasterId {
  implicit val implEq: Eq[TokenMasterId] = {
    import auto.eq._
    semi.eq
  }

  implicit val implTokenId = new TokenId[TokenMasterId] {
    def value(self: Self) = self.value
  }
}
