package com.anontown.entities.storage

import cats._, cats.implicits._, cats.derived._
import java.util.regex.Pattern;
import com.anontown.{RegexValidator, StructureValidator, CharType}
import com.anontown.AtParamsError

final case class StorageValue(value: String) extends AnyVal;
object StorageValue {
  val valueRegexValidator: RegexValidator =
    RegexValidator(
      Pattern.compile("[\\s\\S]{0,100000}"),
      "ストレージの値は0～100000文字にして下さい"
    );

  val valueStructureValidator: StructureValidator = StructureValidator(
    List(CharType.All()),
    Some(0),
    Some(100000)
  );

  implicit val implEq: Eq[StorageKey] = {
    import auto.eq._
    semi.eq
  }

  def fromString(
      value: String
  ): Either[AtParamsError, StorageValue] = {
    valueRegexValidator.apValidate("value", value).map(StorageValue(_))
  }
}
