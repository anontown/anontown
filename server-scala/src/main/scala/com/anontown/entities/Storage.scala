package com.anontown.entities

import cats._, cats.implicits._, cats.derived._
import com.anontown.AuthTokenMaster
import com.anontown.AtError
import com.anontown.Constant
import com.anontown.AuthTokenGeneral
import com.anontown.AtParamsError
import com.anontown.AtRightError
import com.anontown.AuthToken

final case class StorageAPI(key: String, value: String);

final case class StorageKey(value: String) extends AnyVal;
object StorageKey {
  implicit val eqImpl: Eq[StorageKey] = {
    import auto.eq._
    semi.eq
  }

  def fromString(
      value: String
  ): Either[AtParamsError, StorageKey] = {
    Constant.Storage.keyRegex.apValidate("key", value).map(StorageKey(_))
  }
}

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

final case class Storage(
    client: Option[ClientId],
    user: UserId,
    key: StorageKey,
    value: StorageValue
) {
  def toAPI(authToken: AuthToken): Either[AtError, StorageAPI] = {
    val authClient = authToken match {
      case AuthTokenMaster(_, _)            => None;
      case auth @ AuthTokenGeneral(_, _, _) => Some(auth.client);
    };
    if (authToken.user =!= this.user || authClient =!= this.client.map(_.value)) {
      Left(new AtRightError("権限がありません"))
    } else {
      Right(StorageAPI(key = this.key.value, value = this.value.value))
    }
  }
}

object Storage {
  implicit val eqImpl: Eq[Storage] = {
    import auto.eq._
    semi.eq
  }

  def create(
      authToken: AuthToken,
      key: String,
      value: String
  ): Either[AtError, Storage] = {
    val client = authToken match {
      case auth @ AuthTokenGeneral(_, _, _) => Some(auth.client);
      case AuthTokenMaster(_, _)            => None
    };
    for {
      (key, value) <- (
        StorageKey.fromString(key).toValidated,
        StorageValue.fromString(value).toValidated
      ).mapN((_, _)).toEither
    } yield Storage(
      client = client.map(ClientId(_)),
      user = authToken.user,
      key = key,
      value = value
    )
  }
}
