package com.anontown.entities.msg

import java.time.OffsetDateTime
import cats._, cats.implicits._, cats.derived._
import com.anontown.utils.Impl._;
import com.anontown.AtError
import com.anontown.ports.ObjectIdGeneratorAlg
import com.anontown.ports.ClockAlg
import com.anontown.AtRightError
import com.anontown.AuthToken
import com.anontown.entities.user.{UserId, User}
import cats.data.EitherT

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

  def create[F[_]: Monad: ObjectIdGeneratorAlg: ClockAlg](
      receiver: Option[User],
      text: String
  ): EitherT[F, AtError, Msg] = {
    for {
      id <- EitherT.right(ObjectIdGeneratorAlg[F].generateObjectId())
      requestDate <- EitherT.right(ClockAlg[F].getRequestDate())
    } yield Msg(
      id = MsgId(id),
      receiver = receiver.map(_.id),
      text = text,
      date = requestDate
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
