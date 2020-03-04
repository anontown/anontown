package com.anontown.services

import cats.tagless.finalAlg
import cats.data.EitherT
import com.anontown.AtError
import com.anontown.entities.user.User
import com.anontown.entities.token.TokenMaster
import com.anontown.ports.{
  RecaptchaClientAlg,
  ObjectIdGeneratorAlg,
  ClockAlg,
  ConfigContainerAlg
}
import cats.Monad
import com.anontown.ports.UserRepositoryAlg
import com.anontown.ports.TokenRepositoryAlg
import com.anontown.ports.SafeIdGeneratorAlg

@finalAlg
trait CreateUserAlg[F[_]] {
  def run(
      sn: String,
      pass: String,
      recaptcha: String
  ): EitherT[F, AtError, (User, TokenMaster)];
}

class CreateUser[F[_]: Monad: RecaptchaClientAlg: ObjectIdGeneratorAlg: ClockAlg: ConfigContainerAlg: UserRepositoryAlg: TokenRepositoryAlg: SafeIdGeneratorAlg]()
    extends CreateUserAlg[F] {
  def run(
      sn: String,
      pass: String,
      recaptcha: String
  ): EitherT[F, AtError, (User, TokenMaster)] = {
    for {
      _ <- RecaptchaClientAlg[F].verifyRecaptcha(recaptcha)
      user <- User.create[F](sn, pass)
      _ <- UserRepositoryAlg[F].insert(user)
      authUser <- user.auth(pass)
      token <- EitherT.right(TokenMaster.create[F](authUser))
      _ <- TokenRepositoryAlg[F].insert(token)
    } yield (user, token)
  }
}
