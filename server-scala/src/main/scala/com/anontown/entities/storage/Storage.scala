package com.anontown.entities.storage

import cats._, cats.implicits._, cats.derived._
import com.anontown.AuthTokenMaster
import com.anontown.AtError
import com.anontown.AuthTokenGeneral
import com.anontown.AtRightError
import com.anontown.AuthToken
import com.anontown.entities.user.UserId
import com.anontown.entities.client.ClientId

final case class StorageAPI(key: String, value: String);

final case class Storage(
    client: Option[ClientId],
    user: UserId,
    key: StorageKey,
    value: StorageValue
);

object Storage {
  implicit val implEq: Eq[Storage] = {
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
      client = client,
      user = authToken.user,
      key = key,
      value = value
    )
  }

  implicit class StorageService(val self: Storage) {
    def toAPI(authToken: AuthToken): Either[AtError, StorageAPI] = {
      val authClient = authToken match {
        case AuthTokenMaster(_, _)            => None;
        case auth @ AuthTokenGeneral(_, _, _) => Some(auth.client);
      };
      if (authToken.user =!= self.user || authClient =!= self.client) {
        Left(new AtRightError("権限がありません"))
      } else {
        Right(StorageAPI(key = self.key.value, value = self.value.value))
      }
    }
  }
}
