package com.anontown.entities.client

import java.time.OffsetDateTime
import cats._, cats.implicits._, cats.derived._
import com.anontown.utils.Impl._;
import com.anontown.AuthTokenMaster
import com.anontown.AtError
import com.anontown.ports.ObjectIdGeneratorAlg
import com.anontown.ports.ClockAlg
import com.anontown.AtRightError
import com.anontown.entities.user.UserId
import cats.data.EitherT

final case class ClientAPI(
    id: String,
    name: String,
    url: String,
    self: Option[Boolean],
    date: String,
    update: String
);

object ClientAPI {
  implicit val implEq: Eq[ClientAPI] = {
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
);

object Client {
  implicit val implEq: Eq[Client] = {
    import auto.eq._
    semi.eq
  }

  def create[F[_]: Monad: ObjectIdGeneratorAlg: ClockAlg](
      authToken: AuthTokenMaster,
      name: String,
      url: String
  ): EitherT[F, AtError, Client] = {
    for {
      id <- EitherT.right(ObjectIdGeneratorAlg[F].generateObjectId())
      (name, url) <- EitherT.fromEither[F](
        (
          ClientName.fromString(name).toValidated,
          ClientUrl.fromString(url).toValidated
        ).mapN((_, _)).toEither
      )

      date <- EitherT.right(ClockAlg[F].getRequestDate())
    } yield Client(
      id = ClientId(id),
      name = name,
      url = url,
      user = authToken.user,
      date = date,
      update = date
    )
  }

  implicit class ClientService(val self: Client) {
    def toAPI(authToken: Option[AuthTokenMaster]): ClientAPI = {
      ClientAPI(
        id = self.id.value,
        name = self.name.value,
        url = self.url.value,
        self = authToken.map(_.user === self.user),
        date = self.date.toString(),
        update = self.update.toString()
      )
    }

    def changeData[F[_]: Monad: ClockAlg](
        authToken: AuthTokenMaster,
        name: Option[String],
        url: Option[String]
    ): EitherT[F, AtError, Client] = {
      if (authToken.user =!= self.user) {
        EitherT.leftT(new AtRightError("人のクライアント変更は出来ません"))
      } else {
        for {
          requestDate <- EitherT.right(ClockAlg[F].getRequestDate())
          result <- EitherT.fromEither[F](
            (
              name
                .map(ClientName.fromString(_))
                .getOrElse(Right(self.name))
                .toValidated,
              url
                .map(ClientUrl.fromString(_))
                .getOrElse(Right(self.url))
                .toValidated
            ).mapN(
                (name, url) =>
                  self
                    .copy(
                      name = name,
                      url = url,
                      update = requestDate
                    )
              )
              .toEither
              .leftWiden[AtError]
          )
        } yield result
      }
    }
  }
}
