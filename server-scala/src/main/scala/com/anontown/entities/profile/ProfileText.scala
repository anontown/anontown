package com.anontown.entities.profile

import cats._, cats.implicits._, cats.derived._
import com.anontown.AtParamsError
import java.util.regex.Pattern;
import com.anontown.{RegexValidator, StructureValidator, CharType}

final case class ProfileText(value: String) extends AnyVal;

object ProfileText {
  val textRegexValidator: RegexValidator = RegexValidator(
    Pattern.compile("[\\s\\S]{1,3000}"),
    "自己紹介文は1～3000文字にして下さい"
  );

  val textStructureValidator: StructureValidator =
    StructureValidator(
      List(CharType.All()),
      Some(1),
      Some(3000)
    );

  implicit val implEq: Eq[ProfileText] = {
    import auto.eq._
    semi.eq
  }

  def fromString(
      value: String
  ): Either[AtParamsError, ProfileText] = {
    textRegexValidator.apValidate("text", value).map(ProfileText(_))
  }
}
