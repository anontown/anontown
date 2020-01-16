package com.anontown.entities.profile

import cats._, cats.implicits._, cats.derived._
import com.anontown.AtParamsError
import com.anontown.Constant

final case class ProfileText(value: String) extends AnyVal;

object ProfileText {
  implicit val eqImpl: Eq[ProfileText] = {
    import auto.eq._
    semi.eq
  }

  def fromString(
      value: String
  ): Either[AtParamsError, ProfileText] = {
    Constant.Profile.textRegex.apValidate("text", value).map(ProfileText(_))
  }
}
