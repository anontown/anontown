package com.anontown.adapters.extra

import org.mongodb.scala._
import cats.effect.IO
import cats.effect.ContextShift
import org.bson.conversions.Bson
import com.mongodb.client.model.ReplaceOptions

class MongoCollectionExtra(val self: MongoCollection[Document]) extends AnyVal {
  def findOneIO(filter: Bson)(
      implicit cs: ContextShift[IO]
  ): IO[Option[Document]] = {
    IO.fromFuture(
      IO(
        self
          .find(filter)
          .first()
          .toFutureOption()
      )
    )
  }

  def insertOneIO(document: Document)(
      implicit cs: ContextShift[IO]
  ): IO[Unit] = {
    IO.fromFuture(
        IO(
          self.insertOne(document).toFuture()
        )
      )
      .map(_ => ())
  }

  def replaceOneIO(filter: Bson, document: Document, upsert: Boolean = false)(
      implicit cs: ContextShift[IO]
  ): IO[Unit] = {
    IO.fromFuture(
        IO(
          self
            .replaceOne(
              filter,
              document,
              options = new ReplaceOptions().upsert(upsert)
            )
            .toFuture()
        )
      )
      .map(_ => ())
  }

  def findIO(filter: Bson)(
      implicit cs: ContextShift[IO]
  ): IO[List[Document]] = {
    IO.fromFuture(
        IO(
          self
            .find(
              filter
            )
            .toFuture()
        )
      )
      .map(xs => xs.toList)
  }

  def deleteOneIO(filter: Bson)(
      implicit cs: ContextShift[IO]
  ): IO[Unit] = {
    IO.fromFuture(
        IO(
          self
            .deleteOne(
              filter
            )
            .toFuture()
        )
      )
      .map(_ => ())
  }
}
