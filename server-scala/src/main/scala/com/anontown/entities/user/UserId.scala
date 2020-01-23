package com.anontown.entities.user

import cats._, cats.implicits._, cats.derived._

final case class UserId(value: String) extends AnyVal;
object UserId {
  implicit val implEq: Eq[UserId] = {
    import auto.eq._
    semi.eq
  }
}
