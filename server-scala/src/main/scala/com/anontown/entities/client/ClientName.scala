package com.anontown.entities.client

import cats._, cats.implicits._, cats.derived._
import com.anontown.Constant
import com.anontown.AtParamsError

final case class ClientName(value: String) extends AnyVal;
object ClientName {
  implicit val implEq: Eq[ClientName] = {
    import auto.eq._
    semi.eq
  }

  def fromString(
      value: String
  ): Either[AtParamsError, ClientName] = {
    Constant.Client.nameRegex.apValidate("name", value).map(ClientName(_))
  }
}
