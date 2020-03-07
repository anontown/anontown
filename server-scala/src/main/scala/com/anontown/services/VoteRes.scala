package com.anontown.services

import cats.tagless.finalAlg
import cats.data.EitherT
import com.anontown.AtError
import com.anontown.entities.res.Res
import com.anontown.entities.res.VoteType
import cats.Monad
import com.anontown.ports.ResRepositoryAlg
import com.anontown.entities.res.UntaggedResId
import com.anontown.ports.UserRepositoryAlg
import com.anontown.ports.AuthContainerAlg

@finalAlg
trait VoteResAlg[F[_]] {
  def run(res: String, voteType: VoteType): EitherT[F, AtError, Res];
}

class VoteRes[F[_]: Monad: ResRepositoryAlg: UserRepositoryAlg: AuthContainerAlg]
    extends VoteResAlg[F] {
  def run(res: String, voteType: VoteType): EitherT[F, AtError, Res] = {
    for {
      res <- ResRepositoryAlg[F].findOne(UntaggedResId(res))
      auth <- AuthContainerAlg[F].getToken()
      user <- UserRepositoryAlg[F].findOne(auth.user)
      // レスを書き込んだユーザー
      resUser <- UserRepositoryAlg[F].findOne(res.user)

      (res, resUser) <- EitherT.fromEither[F](
        res.resetAndVote(resUser, user, voteType, auth)
      )

      _ <- ResRepositoryAlg[F].update(res)
      _ <- UserRepositoryAlg[F].update(resUser)
    } yield res
  }
}
