package com.anontown.services

import cats.tagless.finalAlg
import com.anontown.entities.profile.ProfileId
import cats.data.EitherT
import com.anontown.AtError
import com.anontown.entities.profile.Profile

@finalAlg
trait ProfileLoaderAlg[F[_]] {
  def load(id: ProfileId): EitherT[F, AtError, Profile];
  def loadMany(id: List[ProfileId]): EitherT[F, AtError, List[Profile]];
}
