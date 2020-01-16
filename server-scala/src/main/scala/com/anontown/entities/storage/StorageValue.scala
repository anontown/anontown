package com.anontown.entities.storage

import cats._, cats.implicits._, cats.derived._
import com.anontown.Constant
import com.anontown.AtParamsError

final case class StorageValue(value: String) extends AnyVal;
object StorageValue {
  implicit val eqImpl: Eq[StorageKey] = {
    import auto.eq._
    semi.eq
  }

  def fromString(
      value: String
  ): Either[AtParamsError, StorageValue] = {
    Constant.Storage.valueRegex.apValidate("value", value).map(StorageValue(_))
  }
}
