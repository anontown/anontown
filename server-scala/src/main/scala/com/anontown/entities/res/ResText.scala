package com.anontown.entities.res

import cats._, cats.implicits._, cats.derived._
import com.anontown.Constant
import com.anontown.AtParamsError

final case class ResText(value: String) extends AnyVal;
object ResText {
  implicit val eqImpl: Eq[ResText] = {
    import auto.eq._
    semi.eq
  }

  def fromString(
      value: String
  ): Either[AtParamsError, ResText] = {
    Constant.Res.textRegex.apValidate("text", value).map(ResText(_))
  }
}
