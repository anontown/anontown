package com.anontown.entities.client

import cats._, cats.implicits._, cats.derived._

final case class ClientId(value: String) extends AnyVal;
object ClientId {
  implicit val eqImpl: Eq[ClientId] = {
    import auto.eq._
    semi.eq
  }
}
