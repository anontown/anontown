package com.anontown.entities.user

import cats._, cats.implicits._, cats.derived._
import com.anontown.AtParamsError
import java.util.regex.Pattern;
import com.anontown.{RegexValidator, StructureValidator, CharType}

final case class UserSn(value: String) extends AnyVal;
object UserSn {
  val snRegexValidator: RegexValidator = RegexValidator(
    Pattern.compile("[a-zA-Z0-9_]{3,20}"),
    "スクリーンネームは半角英数字、アンダーバー3～20文字にして下さい"
  );

  val snStructureValidator: StructureValidator =
    StructureValidator(
      List(CharType.Lc(), CharType.Uc(), CharType.D(), CharType.Ub()),
      Some(3),
      Some(20)
    );

  implicit val implEq: Eq[UserSn] = {
    import auto.eq._
    semi.eq
  }

  def fromString(
      value: String
  ): Either[AtParamsError, UserSn] = {
    snRegexValidator.apValidate("sn", value).map(UserSn(_))
  }
}
