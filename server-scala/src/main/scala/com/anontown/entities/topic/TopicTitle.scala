package com.anontown.entities.topic

import cats._, cats.implicits._, cats.derived._
import java.util.regex.Pattern;
import com.anontown.{RegexValidator, StructureValidator, CharType}

final case class TopicTitle(value: String) extends AnyVal;
object TopicTitle {
  val titleRegexValidator: RegexValidator =
    RegexValidator(
      Pattern.compile("[\\S]{1,100}"),
      "タイトルは1～100文字にして下さい"
    );

  val titleStructureValidator: StructureValidator = StructureValidator(
    List(CharType.NotNewLine()),
    Some(1),
    Some(100)
  );

  implicit val implEq: Eq[TopicTitle] = {
    import auto.eq._
    semi.eq
  }
}
