package com.anontown.services

import cats.tagless.finalAlg
import cats.data.EitherT
import com.anontown.entities.profile.{Profile, ProfileId}
import com.anontown.AtError

@finalAlg
trait ProfileLoaderAlg[F[_]] {
  def load(id: ProfileId): EitherT[F, AtError, Profile]
  def loadMany(ids: List[ProfileId]): EitherT[F, AtError, List[Profile]]
}
