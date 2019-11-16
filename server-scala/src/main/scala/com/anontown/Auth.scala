package com.anontown;
import com.anontown.entities.UserId
import com.anontown.entities.TokenId
import com.anontown.entities.ClientId

sealed trait AuthToken {
  val id: TokenId;
  val user: UserId;
}

final case class AuthTokenGeneral(
    id: TokenId,
    user: UserId,
    client: ClientId
) extends AuthToken;

final case class AuthTokenMaster(
    id: TokenId,
    user: UserId
) extends AuthToken;

final case class AuthUser(id: UserId);
