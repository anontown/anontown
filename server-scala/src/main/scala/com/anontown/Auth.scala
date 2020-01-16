package com.anontown;
import com.anontown.entities.user.UserId
import com.anontown.entities.token.TokenId
import com.anontown.entities.client.ClientId

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
