package com.anontown.entities.user

import com.anontown.utils;
import cats._, cats.implicits._, cats.derived._
import com.anontown.ports.ConfigContainerAlg

final case class UserEncryptedPass(value: String) extends AnyVal {
  def validation[F[_]: Monad: ConfigContainerAlg](pass: String): F[Boolean] = {
    UserEncryptedPass.hash[F](pass).map(this.value === _)
  }
}

object UserEncryptedPass {
  implicit val implEq: Eq[UserEncryptedPass] = {
    import auto.eq._
    semi.eq
  }

  def fromRawPass[F[_]: Monad: ConfigContainerAlg](
      pass: UserRawPass
  ): F[UserEncryptedPass] = {
    UserEncryptedPass.hash[F](pass.value).map(UserEncryptedPass(_))
  }

  def hash[F[_]: Monad: ConfigContainerAlg](pass: String): F[String] = {
    ConfigContainerAlg[F]
      .getConfig()
      .map(config => utils.hash(pass + config.salt.pass))
  }
}
