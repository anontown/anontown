package com.anontown.services

import cats.tagless.finalAlg
import com.anontown.AuthUser
import cats.data.EitherT
import com.anontown.AtError
import com.anontown.entities.token.TokenMaster
import cats.Monad
import com.anontown.ports.TokenRepositoryAlg
import com.anontown.ports.ObjectIdGeneratorAlg
import com.anontown.ports.SafeIdGeneratorAlg
import com.anontown.ports.ClockAlg
import com.anontown.ports.ConfigContainerAlg

@finalAlg
trait CreateTokenMasterAlg[F[_]] {
  def run(authUser: AuthUser): EitherT[F, AtError, TokenMaster];
}

class CreateTokenMaster[F[_]: Monad: TokenRepositoryAlg: ObjectIdGeneratorAlg: SafeIdGeneratorAlg: ClockAlg: ConfigContainerAlg]
    extends CreateTokenMasterAlg[F] {
  def run(authUser: AuthUser): EitherT[F, AtError, TokenMaster] = {
    for {
      token <- EitherT.right(TokenMaster.create[F](authUser))
      _ <- TokenRepositoryAlg[F].insert(token)
    } yield token
  }
}
