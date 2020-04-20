package com.anontown.adapters

import org.mongodb.scala._
import com.anontown.ports.ClientRepositoryAlg
import cats.effect.IO
import cats.data.EitherT
import com.anontown.entities.client.{Client, ClientId}
import com.anontown.AtError
import cats.effect.ContextShift
import com.anontown.entities.client.ClientName
import com.anontown.entities.client.ClientUrl
import com.anontown.entities.user.UserId
import com.anontown.entities.DateTime
import org.bson.types.ObjectId
import java.{util => ju}
import org.mongodb.scala.model.Filters
import com.anontown.AtNotFoundError
import com.anontown.adapters.extra._

class ClientRepository(db: MongoDatabase)(implicit cs: ContextShift[IO])
    extends ClientRepositoryAlg[IO] {
  val collection = db.getCollection[Document]("clients")
  override def findOne(id: ClientId): EitherT[IO, AtError, Client] = {
    for {
      client <- EitherT
        .fromOptionF(
          collection.findOneIO(Filters.eq("_id", new ObjectId(id.value))),
          new AtNotFoundError("クライアントが存在しません"): AtError
        )
        .map(ClientRepository.fromDocument(_))
    } yield client
  }

  override def insert(client: Client): EitherT[IO, AtError, Unit] = {
    EitherT
      .right(
        collection.insertOneIO(ClientRepository.toDocument(client))
      )
  }

  override def update(client: Client): EitherT[IO, AtError, Unit] = {
    EitherT
      .right(
        collection
          .replaceOneIO(
            Filters.eq("_id", new ObjectId(client.id.value)),
            ClientRepository.toDocument(client)
          )
      )
  }

  override def find(
      ids: Option[List[ClientId]],
      users: Option[List[UserId]]
  ): EitherT[IO, AtError, List[Client]] = {
    for {
      result <- EitherT
        .right[AtError](
          collection
            .findIO(
              Filters.and(
                List(
                  users.map(
                    users =>
                      Filters
                        .in(
                          "user",
                          users.map(user => new ObjectId(user.value)): _*
                        )
                  ),
                  ids.map(
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
        )
        .map(
          clients => clients.map(x => ClientRepository.fromDocument(x))
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
