package com.anontown.services

import cats.tagless.finalAlg
import cats.data.EitherT
import com.anontown.AtError
import com.anontown.entities.token.TokenGeneral
import cats.Monad
import com.anontown.ports.TokenRepositoryAlg
import com.anontown.ports.ClockAlg
import com.anontown.entities.token.UntaggedTokenId
import com.anontown.AtNotFoundError

@finalAlg
trait AuthTokenReqAlg[F[_]] {
  def run(id: String, key: String): EitherT[F, AtError, TokenGeneral];
}

class AuthTokenReq[F[_]: Monad: TokenRepositoryAlg: ClockAlg]
    extends AuthTokenReqAlg[F] {
  def run(id: String, key: String): EitherT[F, AtError, TokenGeneral] = {
    for {
      token <- TokenRepositoryAlg[F].findOne(UntaggedTokenId(id))
      token <- EitherT.fromEither[F](
        token.asTokenGeneral
          .map(Right(_))
          .getOrElse(Left(new AtNotFoundError("トークンが見つかりません"): AtError))
      )
      // TODO: authReqの引数が何かを返してそれを返すようにしたい
      _ <- token.authReq[F](key)
    } yield token
  }
}
