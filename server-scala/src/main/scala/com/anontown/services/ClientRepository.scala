package com.anontown.services

import cats.tagless._
import cats.data.EitherT
import com.anontown.AtError
import com.anontown.entities.client.{Client, ClientId}
import com.anontown.AuthTokenMaster

@finalAlg
trait ClientRepositoryAlg[F[_]] {
  def load(id: ClientId): EitherT[F, AtError, Client];
  def loadMany(ids: List[ClientId]): EitherT[F, AtError, List[Client]];
  def findOne(id: ClientId): EitherT[F, AtError, Client];
  def insert(client: Client): EitherT[F, AtError, Unit];
  def update(client: Client): EitherT[F, AtError, Unit];
  def find(
      authToken: Option[AuthTokenMaster],
      query: ClientRepositoryAlg.Query
  ): EitherT[F, AtError, List[Client]];
}

object ClientRepositoryAlg {
  final case class Query(id: Option[List[ClientId]], self: Option[Boolean]);
}
