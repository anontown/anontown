package com.anontown.ports

import cats.tagless._
import cats.data.EitherT
import com.anontown.AtError
import com.anontown.entities.client.{Client, ClientId}
import com.anontown.AuthTokenMaster

@finalAlg
trait ClientRepositoryAlg[F[_]] {
  def findOne(id: ClientId): EitherT[F, AtError, Client];
  def insert(client: Client): EitherT[F, AtError, Unit];
  def update(client: Client): EitherT[F, AtError, Unit];
  def find(
      authToken: Option[AuthTokenMaster],
      id: Option[List[ClientId]],
      self: Option[Boolean]
  ): EitherT[F, AtError, List[Client]];
}
