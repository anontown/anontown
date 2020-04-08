package com.anontown;
import com.anontown.entities.user.UserId
import com.anontown.entities.client.ClientId
import com.anontown.entities.token.TokenMasterId
import com.anontown.entities.token.TokenGeneralId
import com.anontown.entities.token.TaggedTokenId

sealed trait AuthToken {
  type IdType <: TaggedTokenId;

  val id: IdType;
  val user: UserId;
}

final case class AuthTokenGeneral(
    id: TokenGeneralId,
    user: UserId,
    client: ClientId
) extends AuthToken {
  type IdType = TokenGeneralId;
}

final case class AuthTokenMaster(
    id: TokenMasterId,
    user: UserId
) extends AuthToken {
  type IdType = TokenMasterId;
}

final case class AuthUser(id: UserId);
