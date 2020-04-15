package com.anontown.adapters

import org.mongodb.scala._
import com.anontown.ports.ClientRepositoryAlg
import cats.effect.IO
import cats.data.EitherT
import com.anontown.entities.client.{Client, ClientId}
import com.anontown.AtError
import com.anontown.{AtError, AuthTokenMaster}
import org.mongodb.scala.bson
import cats.effect.ContextShift

class ClientRepository(db: MongoDatabase)(implicit cs: ContextShift[IO])
    extends ClientRepositoryAlg[IO] {
  override def findOne(id: ClientId): EitherT[IO, AtError, Client] = {
    val x = bson.BsonDocument("x" -> "");
    val _ = IO.fromFuture(
      IO(db.getCollection[Document]("clients").find(x).first().toFuture())
    );
    val _ = (??? : Document).getBoolean("");
    ???
  }

  override def insert(client: Client): EitherT[IO, AtError, Unit] = ???

  override def update(client: Client): EitherT[IO, AtError, Unit] = ???

  override def find(
      authToken: Option[AuthTokenMaster],
      id: Option[List[ClientId]],
      self: Option[Boolean]
  ): EitherT[IO, AtError, List[Client]] = ???

}
