package com.anontown.entities.storage

import cats._, cats.implicits._, cats.derived._
import com.anontown.Constant
import com.anontown.AtParamsError

final case class StorageKey(value: String) extends AnyVal;
object StorageKey {
  implicit val implEq: Eq[StorageKey] = {
    import auto.eq._
    semi.eq
  }

  def fromString(
      value: String
  ): Either[AtParamsError, StorageKey] = {
    Constant.Storage.keyRegex.apValidate("key", value).map(StorageKey(_))
  }
}
