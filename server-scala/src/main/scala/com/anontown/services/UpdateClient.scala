package com.anontown.services

import cats.tagless.finalAlg
import cats.data.EitherT
import com.anontown.entities.client.Client
import com.anontown.AtError
import cats.Monad
import com.anontown.ports.ClientRepositoryAlg
import com.anontown.entities.client.ClientId
import com.anontown.ports.AuthContainerAlg
import com.anontown.ports.ClockAlg

@finalAlg
trait UpdateClientAlg[F[_]] {
  def run(
      id: String,
      name: Option[String],
      url: Option[String]
  ): EitherT[F, AtError, Client];
}

class UpdateClient[F[_]: Monad: ClientRepositoryAlg: AuthContainerAlg: ClockAlg: MutationLoggerAlg]
    extends UpdateClientAlg[F] {
  def run(
      id: String,
      name: Option[String],
      url: Option[String]
  ): EitherT[F, AtError, Client] = {
    for {
      client <- ClientRepositoryAlg[F].findOne(ClientId(id))
      authToken <- AuthContainerAlg[F].getTokenMaster()
      client <- client.changeData[F](authToken, name, url)
      _ <- ClientRepositoryAlg[F].update(client)
      _ <- EitherT.right(
        MutationLoggerAlg[F].updateLog("clients", client.id.value)
      )
    } yield client
  }
}
