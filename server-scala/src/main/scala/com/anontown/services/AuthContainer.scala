package com.anontown.services;

import com.anontown.AtError;
import com.anontown.AuthToken;
import com.anontown.AuthTokenMaster
import cats.tagless._
import cats.data.EitherT

@finalAlg
trait AuthContainerAlg[F[_]] {
  def getToken(): EitherT[F, AtError, AuthToken];
  def getTokenMaster(): EitherT[F, AtError, AuthTokenMaster];
  def getOptionToken(): F[Option[AuthTokenMaster]];
  def getOptionMasterToken(): F[Option[AuthTokenMaster]];
}
