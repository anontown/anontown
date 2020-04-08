package com.anontown.entities.profile

import cats._, cats.implicits._, cats.derived._

final case class ProfileId(value: String) extends AnyVal;

object ProfileId {
  implicit val implEq: Eq[ProfileId] = {
    import auto.eq._
    semi.eq
  }
}
