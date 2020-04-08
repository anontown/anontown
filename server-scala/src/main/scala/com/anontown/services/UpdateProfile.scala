package com.anontown.services

import cats.tagless.finalAlg
import cats.data.EitherT
import com.anontown.AtError
import com.anontown.entities.profile.Profile
import cats.Monad
import com.anontown.ports.ProfileRepositoryAlg
import com.anontown.entities.profile.ProfileId
import com.anontown.ports.AuthContainerAlg
import com.anontown.ports.ClockAlg

@finalAlg
trait UpdateProfileAlg[F[_]] {
  def run(
      id: String,
      name: Option[String],
      text: Option[String],
      sn: Option[String]
  ): EitherT[F, AtError, Profile];
}

class UpdateProfile[F[_]: Monad: ProfileRepositoryAlg: AuthContainerAlg: ClockAlg: MutationLoggerAlg]
    extends UpdateProfileAlg[F] {
  def run(
      id: String,
      name: Option[String],
      text: Option[String],
      sn: Option[String]
  ): EitherT[F, AtError, Profile] = {
    for {
      auth <- AuthContainerAlg[F].getToken()
      profile <- ProfileRepositoryAlg[F].findOne(ProfileId(id))
      profile <- profile.changeData(auth, name, text, sn)
      _ <- ProfileRepositoryAlg[F].update(profile)
      _ <- EitherT.right(
        MutationLoggerAlg[F].updateLog("profiles", profile.id.value)
      )
    } yield profile
  }
}
