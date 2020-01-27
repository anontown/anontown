package com.anontown.entities.token

import java.time.OffsetDateTime
import com.anontown.utils;
import com.anontown.services.SafeIdGeneratorAlg
import zio.ZIO
import com.anontown.AtServerError
import com.anontown.services.ConfigContainerAlg
import com.anontown.entities.user.UserId
import monocle.syntax.ApplyLens
import shapeless._
import record._
import simulacrum._
import com.anontown.utils.Record._
import com.anontown.entities.token.TokenId.ops._

trait TokenAPI {
  val id: String
  val key: String
  val date: String
}

@typeclass
trait Token[A] extends AnyRef {
  type Self = A;
  type IdType;
  implicit val implTokenIdForIdType: TokenId[IdType];

  type API <: TokenAPI;
  type SelfApplyLens[T] = ApplyLens[A, A, T, T];

  def id(self: A): SelfApplyLens[IdType];
  def key(self: A): SelfApplyLens[String];
  def user(self: A): SelfApplyLens[UserId];
  def date(self: A): SelfApplyLens[OffsetDateTime];

  def toAPI(self: A): API;
}

object Token {
  implicit class TokenService[A](val self: A)(
      implicit val implToken: Token[A]
  ) {
    import Token.ops._;
    import implToken.implTokenIdForIdType;

    type TokenAPIIntrinsicProperty =
      ("id" ->> String) ::
        ("key" ->> String) ::
        ("date" ->> String) ::
        HNil;

    def tokenAPIIntrinsicProperty: TokenAPIIntrinsicProperty = {
      Record(
        id = self.id.get.value,
        key = self.key.get,
        date = self.date.get.toString
      )
    }
  }

  def createTokenKey(): ZIO[
    SafeIdGeneratorAlg with ConfigContainerAlg,
    AtServerError,
    String
  ] = {
    for {
      genId <- ZIO.accessM[SafeIdGeneratorAlg](
        _.safeIdGenerator.generateSafeId()
      )

      tokenSalt <- ZIO.access[ConfigContainerAlg](
        _.configContainer.config.salt.token
      )
    } yield utils.hash(genId + tokenSalt)
  }
}
