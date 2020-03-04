package com.anontown.entities.token

import java.time.OffsetDateTime
import com.anontown.utils;
import com.anontown.ports.SafeIdGeneratorAlg
import com.anontown.ports.ConfigContainerAlg
import com.anontown.entities.user.UserId
import monocle.syntax.ApplyLens
import shapeless._
import record._
import com.anontown.utils.Record._
import cats._, cats.implicits._, cats.derived._
import monocle.macros.syntax.lens.toGenApplyLensOps
import com.anontown.AuthUser
import com.anontown.ports.ObjectIdGeneratorAlg
import com.anontown.ports.ClockAlg
import com.anontown.AtError
import com.anontown.AtTokenAuthError
import com.anontown.AuthTokenMaster
import com.anontown.entities.client.{ClientId, Client}
import com.anontown.AuthTokenGeneral
import cats.data.EitherT
import com.anontown.utils.OffsetDateTimeUtils._;
import com.anontown.AtNotFoundError

sealed trait TokenAPI {
  val id: String
  val key: String
  val date: String
}

object TokenAPI {
  implicit val implEq: Eq[TokenAPI] = {
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
  implicit val implEq: Eq[TokenGeneralAPI] = {
    import auto.eq._
    semi.eq
  }
}

final case class TokenMasterAPI(id: String, key: String, date: String)
    extends TokenAPI

object TokenMasterAPI {
  implicit val implEq: Eq[TokenMasterAPI] = {
    import auto.eq._
    semi.eq
  }
}

sealed trait Token {
  type Self <: Token;
  type IdType <: TaggedTokenId;

  type API <: TokenAPI;
  type SelfApplyLens[A] = ApplyLens[Self, Self, A, A];

  def idLens: SelfApplyLens[IdType];
  def keyLens: SelfApplyLens[String];
  def userLens: SelfApplyLens[UserId];
  def dateLens: SelfApplyLens[OffsetDateTime];

  def toAPI: API;
}

object Token {
  implicit class TokenService[A <: Token { type Self = A }](val self: A) {
    type TokenAPIIntrinsicProperty =
      ("id" ->> String) ::
        ("key" ->> String) ::
        ("date" ->> String) ::
        HNil;

    def tokenAPIIntrinsicProperty: TokenAPIIntrinsicProperty = {
      Record(
        id = self.idLens.get.value,
        key = self.keyLens.get,
        date = self.dateLens.get.toString
      )
    }
  }

  def createTokenKey[F[_]: Monad: SafeIdGeneratorAlg: ConfigContainerAlg]()
      : F[String] = {
    for {
      genId <- SafeIdGeneratorAlg[F].generateSafeId()
      tokenSalt <- ConfigContainerAlg[F].getConfig().map(_.salt.token)
    } yield utils.hash(genId + tokenSalt)
  }
}

final case class TokenMaster(
    id: TokenMasterId,
    key: String,
    user: UserId,
    date: OffsetDateTime
) extends Token {
  override type Self = TokenMaster;
  override type IdType = TokenMasterId;
  override type API = TokenMasterAPI;

  override def idLens = this.lens(_.id);
  override def keyLens = this.lens(_.key);
  override def userLens = this.lens(_.user);
  override def dateLens = this.lens(_.date);

  override def toAPI: TokenMasterAPI = {
    LabelledGeneric[TokenMasterAPI].from(
      this.tokenAPIIntrinsicProperty
    )
  }
}

object TokenMaster {
  def create[F[_]: Monad: ObjectIdGeneratorAlg: ClockAlg: SafeIdGeneratorAlg: ConfigContainerAlg](
      authUser: AuthUser
  ): F[
    TokenMaster
  ] = {
    for {
      id <- ObjectIdGeneratorAlg[F].generateObjectId()
      key <- Token.createTokenKey[F]()
      requestDate <- ClockAlg[F].getRequestDate()
    } yield TokenMaster(
      id = TokenMasterId(id),
      key = key,
      user = authUser.id,
      date = requestDate
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

final case class TokenGeneral(
    id: TokenGeneralId,
    key: String,
    client: ClientId,
    user: UserId,
    req: List[TokenReq],
    date: OffsetDateTime
) extends Token {
  override type Self = TokenGeneral;
  override type IdType = TokenGeneralId;
  override type API = TokenGeneralAPI;

  override def idLens = this.lens(_.id);
  override def keyLens = this.lens(_.key);
  override def userLens = this.lens(_.user);
  override def dateLens = this.lens(_.date);

  override def toAPI: TokenGeneralAPI = {
    LabelledGeneric[TokenGeneralAPI].from(
      this.tokenAPIIntrinsicProperty.merge(
        Record(clientID = this.client.value)
      )
    )
  }
}

object TokenGeneral {
  def create[F[_]: Monad: ClockAlg: ObjectIdGeneratorAlg: SafeIdGeneratorAlg: ConfigContainerAlg](
      authToken: AuthTokenMaster,
      client: Client
  ): F[
    TokenGeneral
  ] = {
    for {
      id <- ObjectIdGeneratorAlg[F].generateObjectId()
      key <- Token.createTokenKey[F]()
      requestDate <- ClockAlg[F].getRequestDate()
    } yield TokenGeneral(
      id = TokenGeneralId(id),
      key = key,
      client = client.id,
      user = authToken.user,
      req = List(),
      date = requestDate
    )
  }

  implicit class TokenGeneralService(val self: TokenGeneral) {
    val reqExpireMinute: Int = 5;

    def createReq[F[_]: Monad: ClockAlg: ConfigContainerAlg: SafeIdGeneratorAlg]()
        : F[(TokenGeneral, TokenReqAPI)] = {
      for {
        requestDate <- ClockAlg[F].getRequestDate()
        val reqFilter = self.req
          .filter(
            r =>
              r.active && requestDate.toEpochMilli < r.expireDate.toEpochMilli
          )
        key <- Token.createTokenKey[F]()
        val req = TokenReq(
          key = key,
          expireDate = ofEpochMilli(
            requestDate.toEpochMilli + 1000 * 60 * reqExpireMinute
          ),
          active = true
        )
      } yield (
        self.copy(req = reqFilter.appended(req)),
        TokenReqAPI(self.id.value, key = req.key)
      )
    }

    def authReq[F[_]: Monad: ClockAlg](
        key: String
    ): EitherT[F, AtError, AuthTokenGeneral] = {
      val req = self.req.find(_.key === key);

      for {
        requestDate <- EitherT.right(ClockAlg[F].getRequestDate())
        _ <- EitherT
          .fromEither[F](req match {
            case Some(req)
                if req.active && req.expireDate.toEpochMilli >= requestDate.toEpochMilli =>
              Right(())
            case _ => Left(new AtNotFoundError("トークンリクエストが見つかりません"))
          })
          .leftWiden[AtError]
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
