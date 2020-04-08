package com.anontown.entities.res

import cats._, cats.implicits._, cats.derived._
import java.util.regex.Pattern;
import com.anontown.{RegexValidator, StructureValidator, CharType}
import com.anontown.AtParamsError

final case class ResText(value: String) extends AnyVal;
object ResText {
  val textRegexValidator: RegexValidator =
    RegexValidator(
      Pattern.compile("[\\S\\s]{1,5000}"),
      "本文は1～5000文字にして下さい"
    );

  val textStructureValidator: StructureValidator = StructureValidator(
    List(CharType.All()),
    Some(1),
    Some(5000)
  );

  implicit val implEq: Eq[ResText] = {
    import auto.eq._
    semi.eq
  }

  def fromString(
      value: String
  ): Either[AtParamsError, ResText] = {
    textRegexValidator.apValidate("text", value).map(ResText(_))
  }
}
