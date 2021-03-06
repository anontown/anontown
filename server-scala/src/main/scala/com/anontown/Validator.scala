package com.anontown;

import java.util.regex.Pattern;
import cats.data.NonEmptyList

/**
  * 文字の種類
  */
sealed trait CharType {
  // 正規表現の文字
  val charClass: String;
}

object CharType {
  // 小文字
  final case class Lc() extends CharType {
    val charClass = "a-z"
  }

  // 大文字
  final case class Uc() extends CharType {
    val charClass = "A-Z"
  }

  // 数値
  final case class D() extends CharType {
    val charClass = "0-9"
  }

  // アンダーバー
  final case class Ub() extends CharType {
    val charClass = "_"
  }

  // ハイフン
  final case class Hy() extends CharType {
    val charClass = "\\-"
  }

  // ひらがな
  final case class Hira() extends CharType {
    val charClass = "\\p{IsHira}ー"
  }

  // カタカナ
  final case class Kana() extends CharType {
    val charClass = "\\p{IsKana}ー"
  }

  // 漢字
  final case class Han() extends CharType {
    val charClass = "\\p{IsHan}"
  }

  // 改行
  final case class All() extends CharType {
    val charClass = "\\s\\S"
  }

  // 改行以外
  final case class NotNewLine() extends CharType {
    val charClass = "."
  }
}

trait Validator {
  def validate(s: String): Boolean;
  val message: String;
  def apValidate(
      field: String,
      value: String
  ): Either[AtParamsError, String] = {
    if (this.validate(value)) {
      Right(value)
    } else {
      Left(
        AtParamsError(
          NonEmptyList.of(AtParamsErrorItem(field, this.message))
        )
      )
    }
  }
}

final case class StructureValidator(
    char: List[CharType],
    min: Option[Int],
    max: Option[Int]
) extends Validator {
  val message = "StructureValidator Error";

  private val pattern: Pattern = {
    val charReg = s"[${char.map(_.charClass).mkString("")}]";
    val lenReg =
      s"{${min.getOrElse(0).toString},${max.map(_.toString).getOrElse("")}}";
    Pattern.compile(s"${charReg}${lenReg}")
  };

  def validate(s: String): Boolean = {
    pattern.matcher(s).matches()
  }
}

final case class RegexValidator(pattern: Pattern, message: String)
    extends Validator {
  def validate(s: String): Boolean = {
    pattern.matcher(s).matches()
  }
}
