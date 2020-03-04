package com.anontown.ports

import cats.tagless.finalAlg
import com.anontown.entities.profile.ProfileId
import cats.data.EitherT
import com.anontown.AtError
import com.anontown.entities.profile.Profile

@finalAlg
trait ProfileRepository[F[_]] {
  def findOne(id: ProfileId): EitherT[F, AtError, Profile];
  def find(
      id: Option[List[ProfileId]],
      self: Option[Boolean]
  ): EitherT[F, AtError, List[Profile]];
  def insert(profile: Profile): EitherT[F, AtError, Unit];
  def update(profile: Profile): EitherT[F, AtError, Unit];
}
