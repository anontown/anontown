package net.kgtkr.anontown.ports;
import net.kgtkr.anontown.AtError;
import net.kgtkr.anontown.AuthToken;
import net.kgtkr.anontown.AuthTokenMaster

trait AuthContainer {
  def token: Either[AtError, AuthToken];
  def tokenMaster: Either[AtError, AuthTokenMaster];
  def optionToken: Option[AuthTokenMaster];
  def optionMasterToken: Option[AuthTokenMaster];
}

trait AuthContainerComponent {
  val authContainer: AuthContainer;
}
