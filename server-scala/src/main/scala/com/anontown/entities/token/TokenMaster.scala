package com.anontown.entities.token

import java.time.OffsetDateTime
import cats._, cats.implicits._, cats.derived._
import com.anontown.utils.Impl._;
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
import com.anontown.entities.user.UserId

final case class TokenMasterAPI(id: String, key: String, date: String)
    extends TokenAPI

object TokenMasterAPI {
  implicit val eqImpl: Eq[TokenMasterAPI] = {
    import auto.eq._
    semi.eq
  }
}

final case class TokenMaster(
    id: TokenMasterId,
    key: String,
    user: UserId,
    date: OffsetDateTime
) extends Token {
  type API = TokenMasterAPI
  type IdType = TokenMasterId

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
      id = TokenMasterId(id),
      key = key,
      user = authUser.id,
      date = now
    )
  }
}
