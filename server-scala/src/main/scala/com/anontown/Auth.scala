package com.anontown;
import com.anontown.entities.UserId
import com.anontown.entities.UserEncryptedPass

sealed trait AuthToken {
  val id: String;
  val key: String;
  val user: UserId;
}

final case class AuthTokenGeneral(
    id: String,
    key: String,
    user: UserId,
    client: String
) extends AuthToken;

final case class AuthTokenMaster(
    id: String,
    key: String,
    user: UserId
) extends AuthToken;

final case class AuthUser(id: UserId, pass: UserEncryptedPass);
