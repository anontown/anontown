package com.anontown.entities.token

import java.time.OffsetDateTime
import com.anontown.utils;
import com.anontown.ports.SafeIdGeneratorComponent
import zio.ZIO
import com.anontown.AtServerError
import com.anontown.ports.ConfigContainerComponent
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
  implicit val tokenIdImpl: TokenId[IdType];

  type API <: TokenAPI;
  type SelfApplyLens[T] = ApplyLens[A, A, T, T];
  type TokenAPIBaseRecord =
    ("id" ->> String) ::
      ("key" ->> String) ::
      ("date" ->> String) ::
      HNil;

  def id(self: A): SelfApplyLens[IdType];
  def key(self: A): SelfApplyLens[String];
  def user(self: A): SelfApplyLens[UserId];
  def date(self: A): SelfApplyLens[OffsetDateTime];

  def fromBaseAPI(self: A)(base: TokenAPIBaseRecord): API;
}

object Token {
  implicit class TokenService[A](val self: A)(
      implicit val tokenImpl: Token[A]
  ) {
    import Token.ops._;
    import tokenImpl.tokenIdImpl;

    def toAPI(): tokenImpl.API = {
      self.fromBaseAPI(
        Record(
          id = self.id.get.value,
          key = self.key.get,
          date = self.date.get.toString
        )
      )
    }
  }

  def createTokenKey(): ZIO[
    SafeIdGeneratorComponent with ConfigContainerComponent,
    AtServerError,
    String
  ] = {
    for {
      genId <- ZIO.accessM[SafeIdGeneratorComponent](
        _.safeIdGenerator.generateSafeId()
      )

      tokenSalt <- ZIO.access[ConfigContainerComponent](
        _.configContainer.config.salt.token
      )
    } yield utils.hash(genId + tokenSalt)
  }
}
