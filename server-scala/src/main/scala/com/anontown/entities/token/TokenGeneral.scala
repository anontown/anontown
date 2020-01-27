package com.anontown.entities.token

import java.time.OffsetDateTime
import cats._, cats.implicits._, cats.derived._
import com.anontown.utils.Impl._;
import com.anontown.utils.OffsetDateTimeUtils._;
import com.anontown.services.SafeIdGeneratorAlg
import zio.ZIO
import com.anontown.AtServerError
import com.anontown.services.ConfigContainerAlg
import com.anontown.AuthTokenMaster
import com.anontown.AtError
import com.anontown.AtTokenAuthError
import com.anontown.services.ObjectIdGeneratorAlg
import com.anontown.services.ClockAlg
import com.anontown.AuthTokenGeneral
import com.anontown.AtNotFoundError
import com.anontown.entities.user.UserId
import com.anontown.entities.client.{ClientId, Client}
import shapeless._
import record._
import monocle.macros.syntax.lens._
import Token.TokenService

final case class TokenGeneralAPI(
    id: String,
    key: String,
    date: String,
    clientID: String
) extends TokenAPI

object TokenGeneralAPI {
  implicit val implEq: Eq[TokenGeneralAPI] = {
    import auto.eq._
    semi.eq
  }
}

final case class TokenGeneral(
    id: TokenGeneralId,
    key: String,
    client: ClientId,
    user: UserId,
    req: List[TokenReq],
    date: OffsetDateTime
);

object TokenGeneral {
  implicit val implEq: Eq[TokenGeneral] = {
    import auto.eq._
    semi.eq
  }

  implicit val implToken: Token[TokenGeneral] {
    type IdType = TokenGeneralId;
    type API = TokenGeneralAPI;
  } = new Token[TokenGeneral] {
    type IdType = TokenGeneralId;
    val implTokenIdForIdType = implicitly

    type API = TokenGeneralAPI;

    override def id(self: Self) = self.lens(_.id);
    override def key(self: Self) = self.lens(_.key);
    override def user(self: Self) = self.lens(_.user);
    override def date(self: Self) = self.lens(_.date);

    override def toAPI(
        self: Self
    ): TokenGeneralAPI = {
      LabelledGeneric[TokenGeneralAPI].from(
        self.tokenAPIIntrinsicProperty.merge(
          Record(clientID = self.client.value)
        )
      )
    }
  }

  def create(authToken: AuthTokenMaster, client: Client): ZIO[
    ClockAlg with ObjectIdGeneratorAlg with SafeIdGeneratorAlg with ConfigContainerAlg,
    AtServerError,
    TokenGeneral
  ] = {
    for {
      id <- ZIO.accessM[ObjectIdGeneratorAlg](
        _.objectIdGenerator.generateObjectId()
      )
      key <- Token.createTokenKey()
      now <- ZIO.access[ClockAlg](_.clock.requestDate)
    } yield TokenGeneral(
      id = TokenGeneralId(id),
      key = key,
      client = client.id,
      user = authToken.user,
      req = List(),
      date = now
    )
  }

  implicit class TokenGeneralService(val self: TokenGeneral) {
    val reqExpireMinute: Int = 5;

    def createReq(): ZIO[
      ClockAlg with ConfigContainerAlg with SafeIdGeneratorAlg,
      AtServerError,
      (TokenGeneral, TokenReqAPI)
    ] = {
      for {
        now <- ZIO.access[ClockAlg](_.clock.requestDate)
        val reqFilter = self.req
          .filter(r => r.active && now.toEpochMilli < r.expireDate.toEpochMilli)
        key <- Token.createTokenKey()
        val req = TokenReq(
          key = key,
          expireDate = ofEpochMilli(
            now.toEpochMilli + 1000 * 60 * reqExpireMinute
          ),
          active = true
        )
      } yield (
        self.copy(req = reqFilter.appended(req)),
        TokenReqAPI(self.id.value, key = req.key)
      )
    }

    def authReq(key: String): ZIO[ClockAlg, AtError, AuthTokenGeneral] = {
      val req = self.req.find(_.key === key);

      for {
        now <- ZIO.access[ClockAlg](_.clock.requestDate)
        _ <- req match {
          case Some(req)
              if req.active && req.expireDate.toEpochMilli >= now.toEpochMilli =>
            ZIO.succeed(())
          case _ => ZIO.fail(new AtNotFoundError("トークンリクエストが見つかりません"))
        }
      } yield AuthTokenGeneral(
        id = self.id,
        user = self.user,
        client = self.client
      )
    }

    def auth(key: String): Either[AtError, AuthTokenGeneral] = {
      if (self.key === key) {
        Right(
          AuthTokenGeneral(
            id = self.id,
            user = self.user,
            client = self.client
          )
        )
      } else {
        Left(new AtTokenAuthError())
      }
    }
  }
}
