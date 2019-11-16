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

final case class ClientAPI(
    id: String,
    name: String,
    url: String,
    self: Option[Boolean],
    date: String,
    update: String
);

object ClientAPI {
  implicit val eqImpl: Eq[ClientAPI] = {
    import auto.eq._
    semi.eq
  }

  implicit val showImpl: Show[ClientAPI] = {
    import auto.show._
    semi.show
  }
}

final case class Client(
    id: String,
    name: String,
    url: String,
    user: UserId,
    date: OffsetDateTime,
    update: OffsetDateTime
) {
  def toAPI(authToken: Option[AuthTokenMaster]): ClientAPI = {
    ClientAPI(
      id = this.id,
      name = this.name,
      url = this.url,
      self = authToken.map(_.user === this.user),
      date = this.date.toString(),
      update = this.update.toString()
    )
  }
}
