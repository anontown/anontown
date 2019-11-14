package com.anontown;
import com.anontown.entities.UserId
import com.anontown.entities.UserEncryptedPass
import com.anontown.entities.TokenId

sealed trait AuthToken {
  val id: TokenId;
  val key: String;
  val user: UserId;
}

final case class AuthTokenGeneral(
    id: TokenId,
    key: String,
    user: UserId,
    client: String
) extends AuthToken;

final case class AuthTokenMaster(
    id: TokenId,
    key: String,
    user: UserId
) extends AuthToken;

final case class AuthUser(id: UserId, pass: UserEncryptedPass);
