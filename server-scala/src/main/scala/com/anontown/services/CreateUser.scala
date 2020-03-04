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

@finalAlg
trait CreateUserAlg[F[_]] {
  def run(
      sn: String,
      pass: String,
      recaptcha: String
  ): EitherT[F, AtError, (User, TokenMaster)];
}

/*
case class CreateUser[F[_]: Monad: RecaptchaClientAlg: ObjectIdGeneratorAlg: ClockAlg: ConfigContainerAlg: UserRepositoryAlg: TokenRepositoryAlg]()
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
      token <- TokenMaster.create[F](user.auth(pass)) // この時点じゃログインしてない
      _ <- TokenRepositoryAlg[F].insert(token)
    } yield ()
  }
}

 */
