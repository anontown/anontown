package com.anontown.adapters

import org.mongodb.scala._
import com.anontown.ports.ClientRepositoryAlg
import cats.effect.IO
import cats.data.EitherT
import com.anontown.entities.client.{Client, ClientId}
import com.anontown.AtError
import com.anontown.{AtError, AuthTokenMaster}
import cats.effect.ContextShift
import com.anontown.entities.client.ClientName
import com.anontown.entities.client.ClientUrl
import com.anontown.entities.user.UserId
import com.anontown.entities.DateTime
import org.bson.types.ObjectId
import java.{util => ju}
import org.mongodb.scala.model.Filters
import com.anontown.AtNotFoundError
import com.anontown.AtAuthError

class ClientRepository(db: MongoDatabase)(implicit cs: ContextShift[IO])
    extends ClientRepositoryAlg[IO] {
  val collection = db.getCollection[Document]("clients")
  override def findOne(id: ClientId): EitherT[IO, AtError, Client] = {
    for {
      client <- EitherT
        .fromOptionF(
          IO.fromFuture(
            IO(
              collection
                .find(Filters.eq("_id", new ObjectId(id.value)))
                .first()
                .toFutureOption()
            )
          ),
          new AtNotFoundError("クライアントが存在しません"): AtError
        )
        .map(ClientRepository.fromDocument(_))
    } yield client
  }

  override def insert(client: Client): EitherT[IO, AtError, Unit] = {
    EitherT
      .right(
        IO.fromFuture(
          IO(
            collection.insertOne(ClientRepository.toDocument(client)).toFuture()
          )
        )
      )
      .map(_ => ())
  }

  override def update(client: Client): EitherT[IO, AtError, Unit] = {
    EitherT
      .right(
        IO.fromFuture(
          IO(
            collection
              .replaceOne(
                Filters.eq("_id", new ObjectId(client.id.value)),
                ClientRepository.toDocument(client)
              )
              .toFuture()
          )
        )
      )
      .map(_ => ())
  }

  override def find(
      authToken: Option[AuthTokenMaster],
      id: Option[List[ClientId]],
      self: Boolean
  ): EitherT[IO, AtError, List[Client]] = {
    for {
      selfToken <- EitherT.fromEither[IO](
        (if (self) {
           authToken.fold(
             Left(new AtAuthError("認証が必要です"): AtError): Either[
               AtError,
               Option[AuthTokenMaster]
             ]
           )(x => Right(Some(x)))
         } else {
           Right(None)
         }): Either[AtError, Option[AuthTokenMaster]]
      )
      result <- EitherT
        .right[AtError](
          IO.fromFuture(
            IO(
              collection
                .find(
                  Filters.and(
                    List(
                      selfToken.map(
                        selfToken =>
                          Filters.eq("user", new ObjectId(selfToken.user.value))
                      ),
                      id.map(
                        ids =>
                          Filters
                            .in(
                              "_id",
                              ids.map(id => new ObjectId(id.value)): _*
                            )
                      )
                    ).flatten: _*
                  )
                )
                .toFuture()
            )
          )
        )
        .map(
          clients => clients.map(x => ClientRepository.fromDocument(x)).toList
        )
    } yield result
  }

}

object ClientRepository {
  def fromDocument(document: Document): Client = {
    Client(
      id = ClientId(document.getObjectId("_id").toHexString()),
      name = ClientName(document.getString("name")),
      url = ClientUrl(document.getString("url")),
      user = UserId(document.getObjectId("user").toHexString()),
      date = DateTime.fromInstant(document.getDate("date").toInstant()),
      update = DateTime.fromInstant(document.getDate("update").toInstant())
    )
  }

  def toDocument(client: Client): Document = {
    Document(
      "_id" -> new ObjectId(client.id.value),
      "name" -> client.name.value,
      "url" -> client.url.value,
      "user" -> new ObjectId(client.user.value),
      "date" -> ju.Date.from(client.date.toInstant),
      "update" -> ju.Date.from(client.update.toInstant)
    )
  }
}
