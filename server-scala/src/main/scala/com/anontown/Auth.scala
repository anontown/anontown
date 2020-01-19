package com.anontown;
import com.anontown.entities.user.UserId
import com.anontown.entities.token.TokenId
import com.anontown.entities.client.ClientId
import com.anontown.entities.token.TokenMasterId
import com.anontown.entities.token.TokenGeneralId

sealed trait AuthToken {
  type IdType;
  implicit val tokenIdImpl: TokenId[IdType];

  val id: IdType;
  val user: UserId;
}

final case class AuthTokenGeneral(
    id: TokenGeneralId,
    user: UserId,
    client: ClientId
) extends AuthToken {
  type IdType = TokenGeneralId;
  implicit val tokenIdImpl = TokenId[IdType]
}

final case class AuthTokenMaster(
    id: TokenMasterId,
    user: UserId
) extends AuthToken {
  type IdType = TokenMasterId;
  implicit val tokenIdImpl = TokenId[IdType]
}

final case class AuthUser(id: UserId);
