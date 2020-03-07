package com.anontown.services

import cats.tagless.finalAlg
import cats.data.EitherT
import com.anontown.AtError
import com.anontown.ports.ResRepositoryAlg
import cats.Monad
import com.anontown.entities.res.ResNormal
import com.anontown.AtNotFoundError
import com.anontown.entities.topic.TopicId
import com.anontown.entities.res.ResId
import com.anontown.entities.res.UntaggedResId
import com.anontown.ports.UserRepositoryAlg
import com.anontown.ports.AuthContainerAlg

@finalAlg
trait DelResAlg[F[_]] {
  def run(
      res: String
  ): EitherT[F, AtError, ResNormal[TopicId, ResId]];
}

class DelRes[F[_]: Monad: ResRepositoryAlg: UserRepositoryAlg: AuthContainerAlg]
    extends DelResAlg[F] {
  def run(
      res: String
  ): EitherT[F, AtError, ResNormal[TopicId, ResId]] = {
    for {
      res <- ResRepositoryAlg[F]
        .findOne(UntaggedResId(res))
      res <- EitherT.fromEither[F](res match {
        case x @ ResNormal(_, _, _, _, _, _, _, _, _, _, _, _, _, _) =>
          Right(x)
        case _ => Left(new AtNotFoundError("レスが見つかりません"): AtError)
      })
      // レスを書き込んだユーザー
      resUser <- UserRepositoryAlg[F].findOne(res.user)

      auth <- AuthContainerAlg[F].getToken()
      (res, resUser) <- EitherT.fromEither[F](res.del(resUser, auth))

      _ <- ResRepositoryAlg[F].update(res)
      _ <- UserRepositoryAlg[F].update(resUser)
    } yield res
  }
}
