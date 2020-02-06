package com.anontown.services

import cats.tagless._
import cats.data.EitherT
import com.anontown.AtError
import com.anontown.entities.history.{History, HistoryId}
import com.anontown.AuthTokenMaster
import com.anontown.entities.topic.{AnyTopicId}

@finalAlg
trait HistoryRepositoryAlg[F[_]] {
  def findOne(id: HistoryId): EitherT[F, AtError, History];
  def insert(client: History): EitherT[F, AtError, Unit];
  def update(client: History): EitherT[F, AtError, Unit];
  def find(
      authToken: Option[AuthTokenMaster],
      query: HistoryRepositoryAlg.Query
  ): EitherT[F, AtError, List[History]];
}

object HistoryRepositoryAlg {
  final case class Query(
      id: Option[List[HistoryId]],
      topic: Option[List[AnyTopicId]],
      date: Option[DateQuery]
  );
}
