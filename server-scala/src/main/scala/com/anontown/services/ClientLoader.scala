package com.anontown.services

import com.anontown.AtError
import com.anontown.entities.client.{Client, ClientId}
import cats.tagless._
import cats.data.EitherT

@finalAlg
trait ClientLoaderAlg[F[_]] {
  def load(id: ClientId): EitherT[F, AtError, Client];
  def loadMany(ids: List[ClientId]): EitherT[F, AtError, List[Client]];
}
