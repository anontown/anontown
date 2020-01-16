package com.anontown.entities.user

import cats._, cats.implicits._, cats.derived._
import com.anontown.AtParamsError
import com.anontown.Constant

final case class UserSn(value: String) extends AnyVal;
object UserSn {
  implicit val eqImpl: Eq[UserSn] = {
    import auto.eq._
    semi.eq
  }

  def fromString(
      value: String
  ): Either[AtParamsError, UserSn] = {
    Constant.User.snRegex.apValidate("sn", value).map(UserSn(_))
  }
}
