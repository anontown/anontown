package com.anontown.services

import cats.tagless.finalAlg
import cats.data.EitherT
import com.anontown.AtError
import com.anontown.entities.client.Client
import cats.Monad
import com.anontown.ports.AuthContainerAlg
import com.anontown.ports.ObjectIdGeneratorAlg
import com.anontown.ports.ClockAlg
import com.anontown.ports.ClientRepositoryAlg

@finalAlg
trait CreateClientAlg[F[_]] {
  def run(name: String, url: String): EitherT[F, AtError, Client];
}

class CreateClient[F[_]: Monad: AuthContainerAlg: ObjectIdGeneratorAlg: ClockAlg: ClientRepositoryAlg: MutationLoggerAlg]
    extends CreateClientAlg[F] {
  def run(name: String, url: String): EitherT[F, AtError, Client] = {
    for {
      authToken <- AuthContainerAlg[F].getTokenMaster()
      client <- Client.create[F](authToken, name, url)
      _ <- ClientRepositoryAlg[F].insert(client)
      _ <- EitherT.right(
        MutationLoggerAlg[F].createLog("clients", client.id.value)
      )
    } yield client
  }
}
