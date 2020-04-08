package com.anontown.services

import cats.Monad
import cats.tagless.finalAlg
import cats.data.EitherT
import com.anontown.{AtError, AtNotFoundError}
import com.anontown.entities.token.{TokenReq, UntaggedTokenId}
import com.anontown.ports.{
  AuthContainerAlg,
  ClockAlg,
  ConfigContainerAlg,
  SafeIdGeneratorAlg,
  TokenRepositoryAlg
}

@finalAlg
trait CreateTokenReqAlg[F[_]] {
  def run(): EitherT[F, AtError, TokenReq];
}

class CreateTokenReq[F[_]: Monad: TokenRepositoryAlg: AuthContainerAlg: SafeIdGeneratorAlg: ClockAlg: ConfigContainerAlg]
    extends CreateTokenReqAlg[F] {
  override def run(): EitherT[F, AtError, TokenReq] = {
    for {
      auth <- AuthContainerAlg[F].getToken()
      token <- TokenRepositoryAlg[F].findOne(
        UntaggedTokenId.fromTokenId(auth.id)
      )
      token <- EitherT
        .fromEither[F](
          token.asTokenGeneral
            .map(Right(_))
            .getOrElse(Left(new AtNotFoundError("トークンが見つかりません"): AtError))
        )

      (token, req) <- EitherT.right(token.createReq[F]())
      _ <- TokenRepositoryAlg[F].update(token)
    } yield req
  }
}

/*
  createTokenReq: async (_obj, _args, context, _info) => {
    const { req, token: newToken } = token.createReq(
      context.ports.clock.now(),
      context.ports.safeIdGenerator,
    );

    await context.ports.tokenRepo.update(newToken);

    return req;
  },
 */
