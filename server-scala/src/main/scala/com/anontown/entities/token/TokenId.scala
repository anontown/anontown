package com.anontown.entities.token

import cats._, cats.implicits._, cats.derived._

sealed trait TokenId {
  type Self <: TokenId;

  def value: String;
}

object TokenId {}

final case class UntaggedTokenId(value: String) extends TokenId {
  override type Self = UntaggedTokenId;
}

object UntaggedTokenId {
  implicit val implEq: Eq[UntaggedTokenId] = {
    import auto.eq._
    semi.eq
  }

  def fromTokenId[A <: TokenId](x: A): UntaggedTokenId =
    UntaggedTokenId(x.value)
}

sealed trait TaggedTokenId extends TokenId {
  override type Self <: TaggedTokenId;
}

object TaggedTokenId {
  implicit val implEq: Eq[TaggedTokenId] = {
    import auto.eq._
    semi.eq
  }
}

final case class TokenGeneralId(value: String) extends TaggedTokenId {
  override type Self = TokenGeneralId;
}

object TokenGeneralId {
  implicit val implEq: Eq[TokenGeneralId] = {
    import auto.eq._
    semi.eq
  }
}

final case class TokenMasterId(value: String) extends TaggedTokenId {
  override type Self = TokenMasterId;
}

object TokenMasterId {
  implicit val implEq: Eq[TokenMasterId] = {
    import auto.eq._
    semi.eq
  }
}
