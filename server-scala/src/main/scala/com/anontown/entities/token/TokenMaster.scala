package com.anontown.entities.token

import java.time.OffsetDateTime
import cats._, cats.implicits._, cats.derived._
import com.anontown.utils.Impl._;
import com.anontown.services.SafeIdGeneratorAlg
import zio.ZIO
import com.anontown.AtServerError
import com.anontown.services.ConfigContainerAlg
import com.anontown.AuthTokenMaster
import com.anontown.AtError
import com.anontown.AtTokenAuthError
import com.anontown.AuthUser
import com.anontown.services.ObjectIdGeneratorAlg
import com.anontown.services.ClockAlg
import com.anontown.entities.user.UserId
import shapeless._
import monocle.macros.syntax.lens._
import Token.TokenService

final case class TokenMasterAPI(id: String, key: String, date: String)
    extends TokenAPI

object TokenMasterAPI {
  implicit val implEq: Eq[TokenMasterAPI] = {
    import auto.eq._
    semi.eq
  }
}

final case class TokenMaster(
    id: TokenMasterId,
    key: String,
    user: UserId,
    date: OffsetDateTime
);

object TokenMaster {
  implicit val implEq: Eq[TokenMaster] = {
    import auto.eq._
    semi.eq
  }

  implicit val implToken: Token[TokenMaster] {
    type API = TokenMasterAPI;
    type IdType = TokenMasterId;
  } = new Token[TokenMaster] {
    type API = TokenMasterAPI;
    type IdType = TokenMasterId;
    val implTokenIdForIdType = implicitly

    def id(self: Self) = self.lens(_.id);
    def key(self: Self) = self.lens(_.key);
    def user(self: Self) = self.lens(_.user);
    def date(self: Self) = self.lens(_.date);

    def toAPI(
        self: Self
    ): TokenMasterAPI = {
      LabelledGeneric[TokenMasterAPI].from(
        self.tokenAPIIntrinsicProperty
      )
    }
  }

  def create(authUser: AuthUser): ZIO[
    ObjectIdGeneratorAlg with ClockAlg with SafeIdGeneratorAlg with ConfigContainerAlg,
    AtServerError,
    TokenMaster
  ] = {
    for {
      id <- ZIO.accessM[ObjectIdGeneratorAlg](
        _.objectIdGenerator.generateObjectId()
      )
      key <- Token.createTokenKey()
      now <- ZIO.access[ClockAlg](_.clock.requestDate)
    } yield TokenMaster(
      id = TokenMasterId(id),
      key = key,
      user = authUser.id,
      date = now
    )
  }

  implicit class TokenMasterService(val self: TokenMaster) {
    def auth(key: String): Either[AtError, AuthTokenMaster] = {
      if (self.key =!= key) {
        Left(new AtTokenAuthError());
      } else {
        Right(AuthTokenMaster(id = self.id, user = self.user))
      }
    }
  }
}
