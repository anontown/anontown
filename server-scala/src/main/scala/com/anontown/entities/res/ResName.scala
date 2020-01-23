package com.anontown.entities.res

import cats._, cats.implicits._, cats.derived._
import com.anontown.Constant
import com.anontown.AtParamsError

final case class ResName(value: String) extends AnyVal;
object ResName {
  implicit val implEq: Eq[ResName] = {
    import auto.eq._
    semi.eq
  }

  def fromString(
      value: String
  ): Either[AtParamsError, ResName] = {
    Constant.Res.nameRegex.apValidate("name", value).map(ResName(_))
  }
}
