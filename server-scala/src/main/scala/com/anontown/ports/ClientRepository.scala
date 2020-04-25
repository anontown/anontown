package com.anontown.ports

import cats.tagless._
import cats.data.EitherT
import com.anontown.AtError
import com.anontown.entities.client.{Client, ClientId}
import com.anontown.entities.user.UserId

@finalAlg
trait ClientRepositoryAlg[F[_]] {
  def findOne(id: ClientId): EitherT[F, AtError, Client];
  def insert(client: Client): EitherT[F, AtError, Unit];
  def update(client: Client): EitherT[F, AtError, Unit];
  /* TODO:
  authToken: Option[AuthTokenMaster], self: Boolean
  を
  user: Option[List[UserId]]
  に変更したので依存コード修正必要
   */
  def find(
      ids: Option[List[ClientId]],
      users: Option[List[UserId]]
  ): EitherT[F, AtError, List[Client]];
}
