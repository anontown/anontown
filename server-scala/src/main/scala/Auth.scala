package net.kgtkr.anontown;

sealed trait AuthToken {
  val id: String;
  val key: String;
  val user: String;
}

final case class AuthTokenGeneral(
    id: String,
    key: String,
    user: String,
    client: String
) extends AuthToken;

final case class AuthTokenMaster(
    id: String,
    key: String,
    user: String
) extends AuthToken;

final case class AuthUser(id: String, pass: String);
