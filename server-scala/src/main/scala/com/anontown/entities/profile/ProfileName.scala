package com.anontown.entities.profile

import cats._, cats.implicits._, cats.derived._
import com.anontown.AtParamsError
import com.anontown.Constant

final case class ProfileName(value: String) extends AnyVal;

object ProfileName {
  implicit val eqImpl: Eq[ProfileName] = {
    import auto.eq._
    semi.eq
  }

  def fromString(
      value: String
  ): Either[AtParamsError, ProfileName] = {
    Constant.Profile.nameRegex.apValidate("name", value).map(ProfileName(_))
  }
}
