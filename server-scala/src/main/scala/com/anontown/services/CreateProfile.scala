package com.anontown.services

import cats.tagless.finalAlg
import cats.data.EitherT
import com.anontown.AtError
import com.anontown.entities.profile.Profile
import cats.Monad
import com.anontown.ports.AuthContainerAlg
import com.anontown.ports.ClockAlg
import com.anontown.ports.ObjectIdGeneratorAlg
import com.anontown.ports.ProfileRepositoryAlg

@finalAlg
trait CreateProfileAlg[F[_]] {
  def run(name: String, text: String, sn: String): EitherT[F, AtError, Profile];
}

class CreateProfile[F[_]: Monad: AuthContainerAlg: ObjectIdGeneratorAlg: ClockAlg: ProfileRepositoryAlg: MutationLoggerAlg]
    extends CreateProfileAlg[F] {
  def run(
      name: String,
      text: String,
      sn: String
  ): EitherT[F, AtError, Profile] = {
    for {
      token <- AuthContainerAlg[F].getToken()
      profile <- Profile.create[F](token, name, text, sn)
      _ <- ProfileRepositoryAlg[F].insert(profile)
      _ <- EitherT.right(
        MutationLoggerAlg[F].createLog("profiles", profile.id.value)
      )
    } yield profile
  }
}
