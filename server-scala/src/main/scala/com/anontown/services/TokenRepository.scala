package com.anontown.services

import com.anontown.entities.token.UntaggedTokenId
import cats.data.EitherT
import com.anontown.AtError
import com.anontown.entities.token.Token
import com.anontown.AuthTokenMaster
import com.anontown.entities.client.ClientId
import com.anontown.AuthUser

trait TokenRepositoryAlg[F[_]] {
  def findOne(id: UntaggedTokenId): EitherT[F, AtError, Token];
  def findAll(authToken: AuthTokenMaster): EitherT[F, AtError, List[Token]];
  def insert(token: Token): EitherT[F, AtError, Unit];
  def update(token: Token): EitherT[F, AtError, Unit];
  def delClientToken(
      token: Token,
      clientID: ClientId
  ): EitherT[F, AtError, Unit];
  def delMasterToken(user: AuthUser): EitherT[F, AtError, Unit];
}
