package com.anontown.entities.user

import com.anontown.Constant
import com.anontown.AtParamsError
import cats._, cats.implicits._, cats.derived._

final case class UserRawPass(value: String) extends AnyVal;
object UserRawPass {
  implicit val implEq: Eq[UserRawPass] = {
    import auto.eq._
    semi.eq
  }

  def fromString(
      value: String
  ): Either[AtParamsError, UserRawPass] = {
    Constant.User.passRegex.apValidate("pass", value).map(UserRawPass(_))
  }
}
