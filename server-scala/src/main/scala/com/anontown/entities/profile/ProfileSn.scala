package com.anontown.entities.profile

import cats._, cats.implicits._, cats.derived._
import com.anontown.AtParamsError
import com.anontown.Constant
final case class ProfileSn(value: String) extends AnyVal;

object ProfileSn {
  implicit val eqImpl: Eq[ProfileSn] = {
    import auto.eq._
    semi.eq
  }

  def fromString(
      value: String
  ): Either[AtParamsError, ProfileSn] = {
    Constant.Profile.snRegex.apValidate("sn", value).map(ProfileSn(_))
  }
}
