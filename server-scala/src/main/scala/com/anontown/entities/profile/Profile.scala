package com.anontown.entities.profile

import java.time.OffsetDateTime
import cats._, cats.implicits._, cats.derived._
import com.anontown.utils.Impl._;
import com.anontown.AtError
import com.anontown.services.ObjectIdGeneratorAlg
import com.anontown.services.ClockAlg
import com.anontown.AtRightError
import com.anontown.AuthToken
import com.anontown.entities.user.UserId
import cats.data.EitherT

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
);

object Profile {
  implicit val implEq: Eq[Profile] = {
    import auto.eq._
    semi.eq
  }

  def create[F[_]: Monad: ObjectIdGeneratorAlg: ClockAlg](
      authToken: AuthToken,
      name: String,
      text: String,
      sn: String
  ): EitherT[
    F,
    AtError,
    Profile
  ] = {
    for {
      (name, text, sn) <- EitherT.fromEither[F](
        (
          ProfileName.fromString(name).toValidated,
          ProfileText.fromString(text).toValidated,
          ProfileSn.fromString(sn).toValidated
        ).mapN((_, _, _)).toEither
      )

      id <- EitherT.right(ObjectIdGeneratorAlg[F].generateObjectId())

      requestDate <- EitherT.right(ClockAlg[F].getRequestDate())
    } yield Profile(
      id = ProfileId(id),
      user = authToken.user,
      name = name,
      text = text,
      date = requestDate,
      update = requestDate,
      sn = sn
    )
  }

  implicit class ProfileService(val self: Profile) {
    def toAPI(authToken: Option[AuthToken]): ProfileAPI = {
      ProfileAPI(
        id = self.id.value,
        self = authToken.map(_.user === self.user),
        name = self.name.value,
        text = self.text.value,
        date = self.date.toString(),
        update = self.update.toString(),
        sn = self.sn.value
      )
    }

    def changeData[F[_]: Monad: ClockAlg](
        authToken: AuthToken,
        name: Option[String],
        text: Option[String],
        sn: Option[String]
    ): EitherT[F, AtError, Profile] = {
      if (authToken.user =!= self.user) {
        EitherT.leftT(new AtRightError("人のプロフィール変更は出来ません"))
      } else {
        for {
          requestDate <- EitherT.right(ClockAlg[F].getRequestDate())
          (name, text, sn) <- EitherT
            .fromEither[F](
              (
                name
                  .map(ProfileName.fromString(_))
                  .getOrElse(Right(self.name))
                  .toValidated,
                text
                  .map(ProfileText.fromString(_))
                  .getOrElse(Right(self.text))
                  .toValidated,
                sn.map(ProfileSn.fromString(_))
                  .getOrElse(Right(self.sn))
                  .toValidated
              ).mapN((_, _, _)).toEither
            )
            .leftWiden[AtError]
        } yield self.copy(
          name = name,
          text = text,
          sn = sn,
          update = requestDate
        );
      }
    }
  }
}
