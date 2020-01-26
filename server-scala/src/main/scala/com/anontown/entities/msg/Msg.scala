package com.anontown.entities.msg

import java.time.OffsetDateTime
import cats._, cats.implicits._, cats.derived._
import com.anontown.utils.Impl._;
import zio.ZIO
import com.anontown.AtError
import com.anontown.services.ObjectIdGeneratorComponent
import com.anontown.services.ClockComponent
import com.anontown.AtRightError
import com.anontown.AuthToken
import com.anontown.entities.user.{UserId, User}

final case class MsgAPI(id: String, priv: Boolean, text: String, date: String);

object MsgAPI {
  implicit val implEq: Eq[MsgAPI] = {
    import auto.eq._
    semi.eq
  }
}

final case class Msg(
    id: MsgId,
    receiver: Option[UserId],
    text: String,
    date: OffsetDateTime
);

object Msg {
  implicit val implEq: Eq[Msg] = {
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

  implicit class HistoryService(val self: Msg) {
    def toAPI(authToken: AuthToken): Either[AtError, MsgAPI] = {
      if (self.receiver.map(_ =!= authToken.user).getOrElse(false)) {
        Left(new AtRightError("アクセス権がありません。"))
      } else {
        Right(
          MsgAPI(
            id = self.id.value,
            priv = self.receiver.isDefined,
            text = self.text,
            date = self.date.toString()
          )
        )
      }
    }
  }
}
