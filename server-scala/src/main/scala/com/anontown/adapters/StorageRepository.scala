package com.anontown.adapters

import com.anontown.ports.ProfileRepositoryAlg
import org.mongodb.scala._
import cats.effect.IO
import cats.data.EitherT
import com.anontown.AtError
import cats.effect.ContextShift
import com.anontown.entities.user.UserId
import com.anontown.entities.DateTime
import org.bson.types.ObjectId
import java.{util => ju}
import org.mongodb.scala.model.Filters
import com.anontown.AtNotFoundError
import com.anontown.adapters.extra._
import com.anontown.entities.profile.{Profile, ProfileId}
import com.anontown.entities.profile.Profile
import com.anontown.entities.profile.ProfileName
import com.anontown.entities.profile.ProfileSn
import com.anontown.entities.profile.ProfileText
import com.anontown.AtConflictError
import com.anontown.ports.StorageRepositoryAlg
import com.anontown.AuthToken
import com.anontown.entities.storage.{Storage, StorageKey, StorageValue}
import com.anontown.entities.storage.Storage
import com.anontown.entities.client.ClientId
import org.bson.BsonObjectId
import org.bson.BsonNull
import org.bson.BsonString
import org.bson.BsonValue

class StorageRepository(db: MongoDatabase)(implicit cs: ContextShift[IO])
    extends StorageRepositoryAlg[IO] {
  val collection = db.getCollection[Document]("storages")
  def findOneByKey(
      userId: UserId,
      clientId: Option[ClientId],
      key: StorageKey
  ): EitherT[IO, AtError, Storage] = { ??? }
  def find(
      userId: UserId,
      clientId: Option[ClientId],
      key: Option[StorageKey]
  ): EitherT[IO, AtError, List[Storage]] = {
    ???
  }
  def save(storage: Storage): EitherT[IO, AtError, Unit] = ???
  def del(storage: Storage): EitherT[IO, AtError, Unit] = ???
}

object StorageRepository {
  def fromStorage(storage: Storage): Document = {
    Document(
      "client" -> storage.client
        .fold[BsonValue](new BsonNull())(
          x => new BsonObjectId(new ObjectId(x.value))
        ),
      "user" -> new BsonObjectId(new ObjectId(storage.user.value)),
      "key" -> new BsonString(storage.key.value),
      "value" -> new BsonString(storage.value.value)
    )
  }

  def toStorage(docuemnt: Document): Storage = {
    (for {
      client <- docuemnt
        .get("client")
        .collect {
          case x: BsonObjectId => Some(ClientId(x.getValue().toHexString()))
          case _: BsonNull     => None
        }
      user <- docuemnt
        .get("user")
        .collect {
          case x: BsonObjectId => UserId(x.getValue().toHexString())
        }
      key <- docuemnt
        .get("key")
        .collect {
          case x: BsonString => StorageKey(x.getValue())
        }
      value <- docuemnt
        .get("value")
        .collect {
          case x: BsonString => StorageValue(x.getValue())
        }
    } yield Storage(client = client, user = user, key = key, value = value)).get
  }
}
