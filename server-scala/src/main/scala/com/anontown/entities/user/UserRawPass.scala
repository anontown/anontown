package com.anontown.entities.user

import com.anontown.AtParamsError
import cats._, cats.implicits._, cats.derived._
import java.util.regex.Pattern;
import com.anontown.{RegexValidator, StructureValidator, CharType}

final case class UserRawPass(value: String) extends AnyVal;
object UserRawPass {
  val passRegexValidator: RegexValidator = RegexValidator(
    Pattern.compile("[a-zA-Z0-9_]{3,50}"),
    "パスワードは半角英数字、アンダーバー3～50文字にして下さい"
  );

  val passStructureValidator: StructureValidator =
    StructureValidator(
      List(CharType.Lc(), CharType.Uc(), CharType.D(), CharType.Ub()),
      Some(3),
      Some(50)
    );

  implicit val implEq: Eq[UserRawPass] = {
    import auto.eq._
    semi.eq
  }

  def fromString(
      value: String
  ): Either[AtParamsError, UserRawPass] = {
    passRegexValidator.apValidate("pass", value).map(UserRawPass(_))
  }
}
