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
import com.anontown.AtParamsError
import com.anontown.AtRightError
import com.anontown.AuthToken

final case class MsgAPI(id: String, priv: Boolean, text: String, date: String);

final case class MsgId(value: String) extends AnyVal;

final case class Msg(
    id: MsgId,
    receiver: Option[UserId],
    text: String,
    date: OffsetDateTime
) {

  def toAPI(authToken: AuthToken): Either[AtError, MsgAPI] = {
    if (this.receiver.map(_ =!= authToken.user).getOrElse(false)) {
      Left(new AtRightError("アクセス権がありません。"))
    } else {
      Right(
        MsgAPI(
          id = this.id.value,
          priv = this.receiver.isDefined,
          text = this.text,
          date = this.date.toString()
        )
      )
    }
  }
}

object Msg {
  implicit val eqImpl: Eq[Client] = {
    import auto.eq._
    semi.eq
  }

  def create(
      receiver: Option[User],
      text: String
  ): ZIO[ObjectIdGeneratorComponent with ClockComponent, AtError, Msg] = {
    for {
      id <- ZIO.accessM[ObjectIdGeneratorComponent](
        _.objectIdGenerator.generateObjectId()
      )
      date <- ZIO.access[ClockComponent](_.clock.requestDate)
    } yield Msg(
      id = MsgId(id),
      receiver = receiver.map(_.id),
      text = text,
      date = date
    )
  }
}
