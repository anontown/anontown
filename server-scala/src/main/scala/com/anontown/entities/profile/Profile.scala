package com.anontown.entities.profile

import java.time.OffsetDateTime
import cats._, cats.implicits._, cats.derived._
import com.anontown.utils.Impl._;
import zio.ZIO
import com.anontown.AtError
import com.anontown.ports.ObjectIdGeneratorComponent
import com.anontown.ports.ClockComponent
import com.anontown.AtRightError
import com.anontown.AuthToken
import com.anontown.entities.user.UserId

final case class ProfileAPI(
    id: String,
    self: Option[Boolean],
    name: String,
    text: String,
    date: String,
    update: String,
    sn: String
);

object ProfileAPI {
  implicit val implEq: Eq[ProfileAPI] = {
    import auto.eq._
    semi.eq
  }
}

final case class Profile(
    id: ProfileId,
    user: UserId,
    name: ProfileName,
    text: ProfileText,
    date: OffsetDateTime,
    update: OffsetDateTime,
    sn: ProfileSn
) {
  def toAPI(authToken: Option[AuthToken]): ProfileAPI = {
    ProfileAPI(
      id = this.id.value,
      self = authToken.map(_.user === this.user),
      name = this.name.value,
      text = this.text.value,
      date = this.date.toString(),
      update = this.update.toString(),
      sn = this.sn.value
    )
  }

  def changeData(
      authToken: AuthToken,
      name: Option[String],
      text: Option[String],
      sn: Option[String]
  )(ports: ClockComponent): Either[AtError, Profile] = {
    if (authToken.user =!= this.user) {
      Left(new AtRightError("人のプロフィール変更は出来ません"))
    } else {
      for {
        (name, text, sn) <- (
          name
            .map(ProfileName.fromString(_))
            .getOrElse(Right(this.name))
            .toValidated,
          text
            .map(ProfileText.fromString(_))
            .getOrElse(Right(this.text))
            .toValidated,
          sn.map(ProfileSn.fromString(_)).getOrElse(Right(this.sn)).toValidated
        ).mapN((_, _, _)).toEither
      } yield this.copy(
        name = name,
        text = text,
        sn = sn,
        update = ports.clock.requestDate
      );
    }
  }
}

object Profile {
  implicit val implEq: Eq[Profile] = {
    import auto.eq._
    semi.eq
  }

  def create(authToken: AuthToken, name: String, text: String, sn: String): ZIO[
    ObjectIdGeneratorComponent with ClockComponent,
    AtError,
    Profile
  ] = {
    for {
      (name, text, sn) <- ZIO.fromEither(
        (
          ProfileName.fromString(name).toValidated,
          ProfileText.fromString(text).toValidated,
          ProfileSn.fromString(sn).toValidated
        ).mapN((_, _, _)).toEither
      )

      id <- ZIO.accessM[ObjectIdGeneratorComponent](
        _.objectIdGenerator.generateObjectId()
      )

      date <- ZIO.access[ClockComponent](_.clock.requestDate)
    } yield Profile(
      id = ProfileId(id),
      user = authToken.user,
      name = name,
      text = text,
      date = date,
      update = date,
      sn = sn
    )
  }
}
