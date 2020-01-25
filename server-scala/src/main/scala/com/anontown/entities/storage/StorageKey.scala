package com.anontown.entities.storage

import cats._, cats.implicits._, cats.derived._
import com.anontown.AtParamsError
import java.util.regex.Pattern;
import com.anontown.{RegexValidator, StructureValidator, CharType}

final case class StorageKey(value: String) extends AnyVal;
object StorageKey {
  val keyRegexValidator: RegexValidator =
    RegexValidator(
      Pattern.compile("[\\s\\S]{1,100}"),
      "ストレージキーは1～100文字にして下さい"
    );

  val keyStructureValidator: StructureValidator = StructureValidator(
    List(CharType.All()),
    Some(1),
    Some(100)
  );

  implicit val implEq: Eq[StorageKey] = {
    import auto.eq._
    semi.eq
  }

  def fromString(
      value: String
  ): Either[AtParamsError, StorageKey] = {
    keyRegexValidator.apValidate("key", value).map(StorageKey(_))
  }
}
