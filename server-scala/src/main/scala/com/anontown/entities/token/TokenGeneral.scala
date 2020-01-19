package com.anontown.entities.token

import java.time.OffsetDateTime
import cats._, cats.implicits._, cats.derived._
import com.anontown.utils.Impl._;
import com.anontown.utils.OffsetDateTimeUtils._;
import com.anontown.ports.SafeIdGeneratorComponent
import zio.ZIO
import com.anontown.AtServerError
import com.anontown.ports.ConfigContainerComponent
import com.anontown.AuthTokenMaster
import com.anontown.AtError
import com.anontown.AtTokenAuthError
import com.anontown.ports.ObjectIdGeneratorComponent
import com.anontown.ports.ClockComponent
import com.anontown.Constant
import com.anontown.AuthTokenGeneral
import com.anontown.AtNotFoundError
import com.anontown.entities.user.UserId
import com.anontown.entities.client.{ClientId, Client}
import shapeless._
import record._
import monocle.macros.syntax.lens._

final case class TokenGeneralAPI(
    id: String,
    key: String,
    date: String,
    clientID: String
) extends TokenAPI

object TokenGeneralAPI {
  implicit val eqImpl: Eq[TokenGeneralAPI] = {
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
) {
  def createReq(): ZIO[
    ClockComponent with ConfigContainerComponent with SafeIdGeneratorComponent,
    AtServerError,
    (TokenGeneral, TokenReqAPI)
  ] = {
    for {
      now <- ZIO.access[ClockComponent](_.clock.requestDate)
      val reqFilter = this.req
        .filter(r => r.active && now.toEpochMilli < r.expireDate.toEpochMilli)
      key <- Token.createTokenKey()
      val req = TokenReq(
        key = key,
        expireDate = ofEpochMilli(
          now.toEpochMilli + 1000 * 60 * Constant.Token.reqExpireMinute
        ),
        active = true
      )
    } yield (
      this.copy(req = reqFilter.appended(req)),
      TokenReqAPI(this.id.value, key = req.key)
    )
  }

  def authReq(key: String): ZIO[ClockComponent, AtError, AuthTokenGeneral] = {
    val req = this.req.find(_.key === key);

    for {
      now <- ZIO.access[ClockComponent](_.clock.requestDate)
      _ <- req match {
        case Some(req)
            if req.active && req.expireDate.toEpochMilli >= now.toEpochMilli =>
          ZIO.succeed(())
        case _ => ZIO.fail(new AtNotFoundError("トークンリクエストが見つかりません"))
      }
    } yield AuthTokenGeneral(
      id = this.id,
      user = this.user,
      client = this.client
    )
  }

  def auth(key: String): Either[AtError, AuthTokenGeneral] = {
    if (this.key === key) {
      Right(
        AuthTokenGeneral(
          id = this.id,
          user = this.user,
          client = this.client
        )
      )
    } else {
      Left(new AtTokenAuthError())
    }
  }
}

object TokenGeneral {
  implicit val eqImpl: Eq[TokenGeneral] = {
    import auto.eq._
    semi.eq
  }

  implicit val tokenImpl = new Token[TokenGeneral] {
    type IdType = TokenGeneralId;
    val tokenIdImpl = TokenId[IdType]

    type API = TokenGeneralAPI;

    override def id(self: Self) = self.lens(_.id);
    override def key(self: Self) = self.lens(_.key);
    override def user(self: Self) = self.lens(_.user);
    override def date(self: Self) = self.lens(_.date);

    override def fromBaseAPI(
        self: Self
    )(base: TokenAPIBaseRecord): TokenGeneralAPI = {
      LabelledGeneric[TokenGeneralAPI].from(
        base.merge(Record(clientID = self.client.value))
      )
    }
  }

  def create(authToken: AuthTokenMaster, client: Client): ZIO[
    ClockComponent with ObjectIdGeneratorComponent with SafeIdGeneratorComponent with ConfigContainerComponent,
    AtServerError,
    TokenGeneral
  ] = {
    for {
      id <- ZIO.accessM[ObjectIdGeneratorComponent](
        _.objectIdGenerator.generateObjectId()
      )
      key <- Token.createTokenKey()
      now <- ZIO.access[ClockComponent](_.clock.requestDate)
    } yield TokenGeneral(
      id = TokenGeneralId(id),
      key = key,
      client = client.id,
      user = authToken.user,
      req = List(),
      date = now
    )
  }
}
