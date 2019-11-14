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

final case class TokenId(value: String) extends AnyVal

object TokenId {
  implicit val eqImpl: Eq[TokenId] = {
    import auto.eq._
    semi.eq
  }

  implicit val showImpl: Show[TokenId] = {
    import auto.show._
    semi.show
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

  implicit val showImpl: Show[TokenReq] = {
    import auto.show._
    semi.show
  }
}

final case class TokenReqAPI(token: String, key: String)

object TokenReqAPI {
  implicit val eqImpl: Eq[TokenReqAPI] = {
    import auto.eq._
    semi.eq
  }

  implicit val showImpl: Show[TokenReqAPI] = {
    import auto.show._
    semi.show
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

  implicit val showImpl: Show[TokenMasterAPI] = {
    import auto.show._
    semi.show
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

  implicit val showImpl: Show[TokenGeneralAPI] = {
    import auto.show._
    semi.show
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
      Right(AuthTokenMaster(id = this.id, key = this.key, user = this.user))
    }
  }
}

object TokenMaster {
  implicit val eqImpl: Eq[TokenMaster] = {
    import auto.eq._
    semi.eq
  }

  implicit val showImpl: Show[TokenMaster] = {
    import auto.show._
    semi.show
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
      this.copy(req = this.req.appended(req)),
      TokenReqAPI(this.id.value, key = req.key)
    )
  }
}
