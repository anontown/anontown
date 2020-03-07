package com.anontown.services

import cats.tagless.finalAlg
import cats.data.EitherT
import com.anontown.AtError
import com.anontown.entities.token.TokenGeneral
import com.anontown.entities.token.TokenReq
import cats.Monad
import com.anontown.ports.ClientRepositoryAlg
import com.anontown.ports.AuthContainerAlg
import com.anontown.ports.ClockAlg
import com.anontown.ports.SafeIdGeneratorAlg
import com.anontown.ports.TokenRepositoryAlg
import com.anontown.entities.client.ClientId
import com.anontown.ports.ObjectIdGeneratorAlg
import com.anontown.ports.ConfigContainerAlg

@finalAlg
trait CreateTokenGeneralAlg[F[_]] {
  def run(client: String): EitherT[F, AtError, (TokenGeneral, TokenReq)];
}

class CreateTokenGeneral[F[_]: Monad: ClientRepositoryAlg: AuthContainerAlg: ClockAlg: SafeIdGeneratorAlg: TokenRepositoryAlg: ObjectIdGeneratorAlg: ConfigContainerAlg]
    extends CreateTokenGeneralAlg[F] {
  def run(client: String): EitherT[F, AtError, (TokenGeneral, TokenReq)] = {
    for {
      client <- ClientRepositoryAlg[F].findOne(ClientId(client))
      auth <- AuthContainerAlg[F].getTokenMaster()
      token <- EitherT.right(TokenGeneral.create[F](auth, client))
      (token, req) <- EitherT.right(token.createReq[F]())
      _ <- TokenRepositoryAlg[F].insert(token)
    } yield (token, req)
  }
}
