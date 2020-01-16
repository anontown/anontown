package com.anontown.entities.token

import cats._, cats.implicits._, cats.derived._

final case class TokenMasterId(value: String) extends TokenId

object TokenMasterId {
  implicit val eqImpl: Eq[TokenMasterId] = {
    import auto.eq._
    semi.eq
  }
}
