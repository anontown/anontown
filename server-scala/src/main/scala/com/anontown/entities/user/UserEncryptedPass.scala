package com.anontown.entities.user

import cats._, cats.implicits._, cats.derived._
import com.anontown.ports.ConfigContainerAlg
import com.anontown.services.HashAlg

final case class UserEncryptedPass(value: String) extends AnyVal {
  def validation[F[_]: Monad: ConfigContainerAlg: HashAlg](
      pass: String
  ): F[Boolean] = {
    UserEncryptedPass.hash[F](pass).map(this.value === _)
  }
}

object UserEncryptedPass {
  implicit val implEq: Eq[UserEncryptedPass] = {
    import auto.eq._
    semi.eq
  }

  def fromRawPass[F[_]: Monad: ConfigContainerAlg: HashAlg](
      pass: UserRawPass
  ): F[UserEncryptedPass] = {
    UserEncryptedPass.hash[F](pass.value).map(UserEncryptedPass(_))
  }

  def hash[F[_]: Monad: ConfigContainerAlg: HashAlg](
      pass: String
  ): F[String] = {
    for {
      config <- ConfigContainerAlg[F]
        .getConfig()
      hash <- HashAlg[F].sha256(pass + config.salt.pass)
    } yield hash
  }
}
