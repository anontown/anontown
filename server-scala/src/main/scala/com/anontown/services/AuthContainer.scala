package com.anontown.services;
import com.anontown.AtError;
import com.anontown.AuthToken;
import com.anontown.AuthTokenMaster

trait AuthContainer {
  def token: Either[AtError, AuthToken];
  def tokenMaster: Either[AtError, AuthTokenMaster];
  def optionToken: Option[AuthTokenMaster];
  def optionMasterToken: Option[AuthTokenMaster];
}

trait AuthContainerComponent {
  val authContainer: AuthContainer;
}
