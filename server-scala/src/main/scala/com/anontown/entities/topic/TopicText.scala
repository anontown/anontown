package com.anontown.entities.topic

import cats._, cats.implicits._, cats.derived._
import java.util.regex.Pattern;
import com.anontown.{RegexValidator, StructureValidator, CharType}

final case class TopicText(value: String) extends AnyVal;
object TopicText {
  val textRegexValidator: RegexValidator =
    RegexValidator(
      Pattern.compile("[\\S\\s]{1,10000}"),
      "本文は1～1万文字以内にして下さい"
    );

  val textStructureValidator: StructureValidator = StructureValidator(
    List(CharType.All()),
    Some(1),
    Some(10000)
  );

  implicit val implEq: Eq[TopicText] = {
    import auto.eq._
    semi.eq
  }
}
