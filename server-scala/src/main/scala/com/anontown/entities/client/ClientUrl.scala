package com.anontown.entities.client

import cats._, cats.implicits._, cats.derived._
import com.anontown.Constant
import com.anontown.AtParamsError

final case class ClientUrl(value: String) extends AnyVal;
object ClientUrl {
  implicit val eqImpl: Eq[ClientUrl] = {
    import auto.eq._
    semi.eq
  }

  def fromString(
      value: String
  ): Either[AtParamsError, ClientUrl] = {
    Constant.Client.urlRegex.apValidate("url", value).map(ClientUrl(_))
  }
}
