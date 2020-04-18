package com.anontown.services

import cats.tagless.finalAlg
import com.anontown.AuthUser
import cats.data.EitherT
import com.anontown.AtError
import com.anontown.entities.user.User
import com.anontown.entities.token.TokenMaster
import cats.Monad
import com.anontown.ports.UserRepositoryAlg
import com.anontown.ports.ConfigContainerAlg
import com.anontown.ports.TokenRepositoryAlg
import com.anontown.ports.ObjectIdGeneratorAlg
import com.anontown.ports.ClockAlg
import com.anontown.ports.SafeIdGeneratorAlg

@finalAlg
trait UpdateUserAlg[F[_]] {
  def run(
      authUser: AuthUser,
      sn: Option[String],
      pass: Option[String]
  ): EitherT[F, AtError, (User, TokenMaster)];
}

class UpdateUser[F[_]: Monad: UserRepositoryAlg: ConfigContainerAlg: TokenRepositoryAlg: ObjectIdGeneratorAlg: ClockAlg: SafeIdGeneratorAlg: HashAlg]
    extends UpdateUserAlg[F] {
  def run(
      authUser: AuthUser,
      sn: Option[String],
      pass: Option[String]
  ): EitherT[F, AtError, (User, TokenMaster)] = {
    for {
      user <- UserRepositoryAlg[F].findOne(authUser.id)
      user <- user.change[F](authUser, pass, sn)
      _ <- UserRepositoryAlg[F].update(user)
      _ <- TokenRepositoryAlg[F].delMasterToken(authUser)
      token <- EitherT.right(TokenMaster.create[F](authUser))
      _ <- TokenRepositoryAlg[F].insert(token)
    } yield (user, token)
  }
}
