package com.anontown.entities

import java.time.OffsetDateTime
import cats._, cats.implicits._, cats.derived._
import com.anontown.utils.Impl._;
import com.anontown.utils;
import com.anontown.utils.OffsetDateTimeUtils._;
import com.anontown.ports.SafeIdGeneratorComponent
import zio.ZIO
import com.anontown.AtServerError
import com.anontown.ports.ConfigContainerComponent
import com.anontown.AuthTokenMaster
import com.anontown.AtError
import com.anontown.AtTokenAuthError
import com.anontown.AuthUser
import com.anontown.ports.ObjectIdGeneratorComponent
import com.anontown.ports.ClockComponent
import com.anontown.Constant
import com.anontown.AuthTokenGeneral
import com.anontown.AtNotFoundError

final case class TokenId(value: String) extends AnyVal

object TokenId {
  implicit val eqImpl: Eq[TokenId] = {
    import auto.eq._
    semi.eq
  }
}

final case class TokenReq(
    key: String,
    expireDate: OffsetDateTime,
    active: Boolean
);

object TokenReq {
  implicit val eqImpl: Eq[TokenReq] = {
    import auto.eq._
    semi.eq
  }
}

final case class TokenReqAPI(token: String, key: String)

object TokenReqAPI {
  implicit val eqImpl: Eq[TokenReqAPI] = {
    import auto.eq._
    semi.eq
  }
}

sealed trait TokenAPI {
  val id: String
  val key: String
  val date: String
}

final case class TokenMasterAPI(id: String, key: String, date: String)
    extends TokenAPI

object TokenMasterAPI {
  implicit val eqImpl: Eq[TokenMasterAPI] = {
    import auto.eq._
    semi.eq
  }
}

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

sealed trait Token {
  val id: TokenId;
  val key: String;
  val user: UserId;
  val date: OffsetDateTime;

  type API <: TokenAPI;

  // toBaseAPIどう実装しよう
  def toAPI(): API = {
    this.fromBaseAPI(
      id = Token.this.id.value,
      key = Token.this.key,
      date = Token.this.date.toString()
    )
  }

  def fromBaseAPI(id: String, key: String, date: String): API;
}

object Token {
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

final case class TokenMaster(
    id: TokenId,
    key: String,
    user: UserId,
    date: OffsetDateTime
) extends Token {
  type API = TokenMasterAPI

  def fromBaseAPI(id: String, key: String, date: String): TokenMasterAPI = {
    TokenMasterAPI(id = id, key = key, date = date)
  }

  def auth(key: String): Either[AtError, AuthTokenMaster] = {
    if (this.key =!= key) {
      Left(new AtTokenAuthError());
    } else {
      Right(AuthTokenMaster(id = this.id, user = this.user))
    }
  }
}

object TokenMaster {
  implicit val eqImpl: Eq[TokenMaster] = {
    import auto.eq._
    semi.eq
  }

  def create(authUser: AuthUser): ZIO[
    ObjectIdGeneratorComponent with ClockComponent with SafeIdGeneratorComponent with ConfigContainerComponent,
    AtServerError,
    TokenMaster
  ] = {
    for {
      id <- ZIO.accessM[ObjectIdGeneratorComponent](
        _.objectIdGenerator.generateObjectId()
      )
      key <- Token.createTokenKey()
      now <- ZIO.access[ClockComponent](_.clock.requestDate)
    } yield TokenMaster(
      id = TokenId(id),
      key = key,
      user = authUser.id,
      date = now
    )
  }
}

final case class TokenGeneral(
    id: TokenId,
    key: String,
    client: String,
    user: UserId,
    req: List[TokenReq],
    date: OffsetDateTime
) extends Token {
  type API = TokenGeneralAPI

  def fromBaseAPI(id: String, key: String, date: String): TokenGeneralAPI = {
    TokenGeneralAPI(id = id, key = key, date = date, clientID = this.client)
  }

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

  // TODO client
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
      id = TokenId(id),
      key = key,
      client = client.id.value,
      user = authToken.user,
      req = List(),
      date = now
    )
  }
}
