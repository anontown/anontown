package com.anontown.services

import cats.Monad
import cats.data.EitherT
import com.anontown.AtError
import com.anontown.entities.res.Res
import com.anontown.ports.ResRepositoryAlg
import com.anontown.entities.res.UntaggedResId
import com.anontown.ports.AuthContainerAlg
import com.anontown.ports.UserRepositoryAlg

trait ClearVoteResAlg[F[_]] {
  def run(res: String): EitherT[F, AtError, Res];
}

class ClearVoteRes[F[_]: Monad: ResRepositoryAlg: AuthContainerAlg: UserRepositoryAlg]
    extends ClearVoteResAlg[F] {
  def run(res: String): EitherT[F, AtError, Res] = {
    for {
      res <- ResRepositoryAlg[F].findOne(UntaggedResId(res))
      auth <- AuthContainerAlg[F].getToken()
      user <- UserRepositoryAlg[F].findOne(auth.user)

      // レスを書き込んだユーザー
      resUser <- UserRepositoryAlg[F].findOne(res.user)

      (res, resUser) <- EitherT.fromEither[F](res.cv(resUser, user, auth))
      _ <- ResRepositoryAlg[F].update(res)
      _ <- UserRepositoryAlg[F].update(resUser)
    } yield res
  }
}
