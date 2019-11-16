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
}

final case class ClientId(value: String) extends AnyVal;
object ClientId {
  implicit val eqImpl: Eq[ClientId] = {
    import auto.eq._
    semi.eq
  }
}

final case class ClientName(value: String) extends AnyVal;
object ClientName {
  implicit val eqImpl: Eq[ClientName] = {
    import auto.eq._
    semi.eq
  }
}

final case class ClientUrl(value: String) extends AnyVal;
object ClientUrl {
  implicit val eqImpl: Eq[ClientUrl] = {
    import auto.eq._
    semi.eq
  }
}

final case class Client(
    id: ClientId,
    name: ClientName,
    url: ClientUrl,
    user: UserId,
    date: OffsetDateTime,
    update: OffsetDateTime
) {
  def toAPI(authToken: Option[AuthTokenMaster]): ClientAPI = {
    ClientAPI(
      id = this.id.value,
      name = this.name.value,
      url = this.url.value,
      self = authToken.map(_.user === this.user),
      date = this.date.toString(),
      update = this.update.toString()
    )
  }
}
