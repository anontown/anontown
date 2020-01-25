package com.anontown.entities.profile

import cats._, cats.implicits._, cats.derived._
import com.anontown.AtParamsError
import java.util.regex.Pattern;
import com.anontown.{RegexValidator, StructureValidator, CharType}

final case class ProfileName(value: String) extends AnyVal;

object ProfileName {
  val nameRegexValidator: RegexValidator = RegexValidator(
    Pattern.compile(".{1,50}"),
    "名前は1～50文字にして下さい"
  );

  val nameStructureValidator: StructureValidator =
    StructureValidator(
      List(CharType.NotNewLine()),
      Some(1),
      Some(50)
    );

  implicit val implEq: Eq[ProfileName] = {
    import auto.eq._
    semi.eq
  }

  def fromString(
      value: String
  ): Either[AtParamsError, ProfileName] = {
    nameRegexValidator.apValidate("name", value).map(ProfileName(_))
  }
}
