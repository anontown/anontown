package com.anontown.entities.client

import cats._, cats.implicits._, cats.derived._
import java.util.regex.Pattern;
import com.anontown.{RegexValidator, StructureValidator, CharType}
import com.anontown.AtParamsError

final case class ClientName(value: String) extends AnyVal;
object ClientName {
  val nameRegexValidator: RegexValidator =
    RegexValidator(
      Pattern.compile("[\\S]{1,30}"),
      "名前は1～30文字にして下さい"
    );

  val nameStructureValidator: StructureValidator = StructureValidator(
    List(CharType.NotNewLine()),
    Some(1),
    Some(30)
  );

  implicit val implEq: Eq[ClientName] = {
    import auto.eq._
    semi.eq
  }

  def fromString(
      value: String
  ): Either[AtParamsError, ClientName] = {
    nameRegexValidator.apValidate("name", value).map(ClientName(_))
  }
}
