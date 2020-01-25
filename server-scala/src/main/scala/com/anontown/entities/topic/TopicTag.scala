package com.anontown.entities.topic

import cats._, cats.implicits._, cats.derived._
import java.util.regex.Pattern;
import com.anontown.{RegexValidator, StructureValidator, CharType}

final case class TopicTag(value: String) extends AnyVal;
object TopicTag {
  val tagRegexValidator: RegexValidator =
    RegexValidator(
      Pattern.compile("[a-z0-9ぁ-んァ-ヶー一-龠々_]{1,20}"),
      "タグは半角小文字英数字ひらがな漢字、アンダーバー1～20文字15個以内にして下さい"
    );

  val tagStructureValidator: StructureValidator = StructureValidator(
    List(
      CharType.Lc(),
      CharType.D(),
      CharType.Hira(),
      CharType.Kana(),
      CharType.Han(),
      CharType.Ub()
    ),
    Some(1),
    Some(20)
  );

  implicit val implEq: Eq[TopicTag] = {
    import auto.eq._
    semi.eq
  }
}
