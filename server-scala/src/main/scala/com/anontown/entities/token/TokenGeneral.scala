package com.anontown.entities.token

import java.time.OffsetDateTime
import cats._, cats.implicits._, cats.derived._
import com.anontown.utils.Impl._;
import com.anontown.utils.OffsetDateTimeUtils._;
import com.anontown.services.SafeIdGeneratorAlg
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
import cats.data.EitherT

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
