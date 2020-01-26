package com.anontown.entities.client

import java.time.OffsetDateTime
import cats._, cats.implicits._, cats.derived._
import com.anontown.utils.Impl._;
import zio.ZIO
import com.anontown.AuthTokenMaster
import com.anontown.AtError
import com.anontown.services.ObjectIdGeneratorComponent
import com.anontown.services.ClockComponent
import com.anontown.AtRightError
import com.anontown.entities.user.UserId

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

  def create(
      authToken: AuthTokenMaster,
      name: String,
      url: String
  ): ZIO[ObjectIdGeneratorComponent with ClockComponent, AtError, Client] = {
    for {
      id <- ZIO.accessM[ObjectIdGeneratorComponent](
        _.objectIdGenerator.generateObjectId()
      )

      (name, url) <- ZIO.fromEither(
        (
          ClientName.fromString(name).toValidated,
          ClientUrl.fromString(url).toValidated
        ).mapN((_, _)).toEither
      )

      date <- ZIO.access[ClockComponent](_.clock.requestDate)
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

    def changeData(
        authToken: AuthTokenMaster,
        name: Option[String],
        url: Option[String]
    )(ports: ClockComponent): Either[AtError, Client] = {
      if (authToken.user =!= self.user) {
        Left(new AtRightError("人のクライアント変更は出来ません"));
      } else {
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
                .copy(name = name, url = url, update = ports.clock.requestDate)
          )
          .toEither
      }
    }
  }
}
