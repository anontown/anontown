package com.anontown.ports

import cats.tagless._
import cats.data.EitherT
import com.anontown.AtError
import com.anontown.entities.history.{History, HistoryId}
import com.anontown.AuthTokenMaster
import com.anontown.entities.topic.UntaggedTopicId;

@finalAlg
trait HistoryRepositoryAlg[F[_]] {
  def findOne(id: HistoryId): EitherT[F, AtError, History];
  def insert(client: History): EitherT[F, AtError, Unit];
  def update(client: History): EitherT[F, AtError, Unit];
  def find(
      authToken: Option[AuthTokenMaster],
      id: Option[List[HistoryId]],
      topic: Option[List[UntaggedTopicId]],
      date: Option[DateQuery]
  ): EitherT[F, AtError, List[History]];
}
