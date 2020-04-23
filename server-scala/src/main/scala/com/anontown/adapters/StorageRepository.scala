package com.anontown.adapters

import com.anontown.ports.ProfileRepositoryAlg
import org.mongodb.scala._
import cats.effect.IO
import cats.data.EitherT
import com.anontown.AtError
import cats.effect.ContextShift
import com.anontown.entities.user.UserId
import org.bson.types.ObjectId
import org.mongodb.scala.model.Filters
import com.anontown.AtNotFoundError
import com.anontown.adapters.extra._
import com.anontown.ports.StorageRepositoryAlg
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
  ): EitherT[IO, AtError, Storage] = {
    for {
      storage <- EitherT
        .fromOptionF(
          collection
            .findOneIO(
              Filters.and(
                Filters.eq("user", new ObjectId(userId.value)),
                Filters
                  .eq("client", clientId.map(id => new ObjectId(id.value))),
                Filters.eq("key", key.value)
              )
            ),
          new AtNotFoundError("ストレージが見つかりません"): AtError
        )
        .map(StorageRepository.fromDocument(_))
    } yield storage
  }
  def find(
      userId: UserId,
      clientId: Option[ClientId],
      keys: Option[List[StorageKey]]
  ): EitherT[IO, AtError, List[Storage]] = {
    for {
      result <- EitherT
        .right[AtError](
          collection
            .findIO(
              Filters.and(
                Filters.eq("user", new ObjectId(userId.value)),
                Filters
                  .eq("client", clientId.map(id => new ObjectId(id.value))),
                Filters.and(
                  List(
                    keys.map(
                      keys => Filters.in("key", keys.map(key => key.value): _*)
                    )
                  ).flatten: _*
                )
              )
            )
        )
        .map(
          storages => storages.map(x => StorageRepository.fromDocument(x))
        )
    } yield result
  }
  def save(storage: Storage): EitherT[IO, AtError, Unit] = {
    EitherT.right[AtError](
      collection
        .replaceOneIO(
          Filters.and(
            Filters.eq("user", new ObjectId(storage.user.value)),
            Filters
              .eq(
                "client",
                storage.client.map(id => new ObjectId(id.value))
              ),
            Filters.eq("key", storage.key.value)
          ),
          StorageRepository.toDocument(storage),
          upsert = true
        )
    )
  }
  def del(storage: Storage): EitherT[IO, AtError, Unit] = {
    for {
      _ <- EitherT
        .right[AtError](
          collection
            .deleteOneIO(
              Filters.and(
                Filters.eq("user", new ObjectId(storage.user.value)),
                Filters
                  .eq(
                    "client",
                    storage.client.map(id => new ObjectId(id.value))
                  ),
                Filters.eq("key", storage.key.value)
              )
            )
        )
    } yield ()
  }
}

object StorageRepository {
  def toDocument(storage: Storage): Document = {
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

  def fromDocument(docuemnt: Document): Storage = {
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
