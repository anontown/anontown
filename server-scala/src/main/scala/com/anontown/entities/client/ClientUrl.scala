package com.anontown.entities.client

import cats._, cats.implicits._, cats.derived._
import java.util.regex.Pattern;
import com.anontown.RegexValidator
import com.anontown.AtParamsError

final case class ClientUrl(value: String) extends AnyVal;
object ClientUrl {
  val urlRegexValidator: RegexValidator =
    RegexValidator(
      Pattern.compile("https?:\\/\\/.{1,500}"),
      "URLが不正です"
    );

  implicit val implEq: Eq[ClientUrl] = {
    import auto.eq._
    semi.eq
  }

  def fromString(
      value: String
  ): Either[AtParamsError, ClientUrl] = {
    urlRegexValidator.apValidate("url", value).map(ClientUrl(_))
  }
}
