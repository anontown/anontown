package net.kgtkr.anontown.ports;
import net.kgtkr.anontown.AtError;
import net.kgtkr.anontown.AuthToken;
import net.kgtkr.anontown.AuthTokenMaster

trait AuthContainer {
  def getToken(): Either[AtError, AuthToken];
  def getTokenMaster(): Either[AtError, AuthTokenMaster];
  def getMaybeToken(): Option[AuthTokenMaster];
  def getMaybeMasterToken(): Option[AuthTokenMaster];
}
