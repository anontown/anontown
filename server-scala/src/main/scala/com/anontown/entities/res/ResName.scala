package com.anontown.entities.res

import cats._, cats.implicits._, cats.derived._
import com.anontown.AtParamsError
import java.util.regex.Pattern;
import com.anontown.{RegexValidator, StructureValidator, CharType}

final case class ResName(value: String) extends AnyVal;
object ResName {
  val nameRegexValidator: RegexValidator =
    RegexValidator(
      Pattern.compile("[\\S]{1,50}"),
      "名前は50文字以内にして下さい"
    );

  val nameStructureValidator: StructureValidator = StructureValidator(
    List(CharType.NotNewLine()),
    Some(1),
    Some(50)
  );

  implicit val implEq: Eq[ResName] = {
    import auto.eq._
    semi.eq
  }

  def fromString(
      value: String
  ): Either[AtParamsError, ResName] = {
    nameRegexValidator.apValidate("name", value).map(ResName(_))
  }
}
