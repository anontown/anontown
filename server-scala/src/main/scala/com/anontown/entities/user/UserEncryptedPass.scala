package com.anontown.entities.user

import com.anontown.utils;
import cats._, cats.implicits._, cats.derived._
import com.anontown.ports.ConfigContainerComponent

final case class UserEncryptedPass(value: String) extends AnyVal {
  def validation(pass: String)(ports: ConfigContainerComponent): Boolean = {
    this.value === UserEncryptedPass.hash(pass)(ports)
  }
}

object UserEncryptedPass {
  implicit val implEq: Eq[UserEncryptedPass] = {
    import auto.eq._
    semi.eq
  }

  def fromRawPass(
      pass: UserRawPass
  )(ports: ConfigContainerComponent): UserEncryptedPass = {
    UserEncryptedPass(UserEncryptedPass.hash(pass.value)(ports))
  }

  def hash(pass: String)(ports: ConfigContainerComponent): String = {
    utils.hash(pass + ports.configContainer.config.salt.pass)
  }
}
