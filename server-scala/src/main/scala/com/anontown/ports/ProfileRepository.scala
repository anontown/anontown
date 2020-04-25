package com.anontown.ports

import cats.tagless.finalAlg
import com.anontown.entities.profile.ProfileId
import cats.data.EitherT
import com.anontown.AtError
import com.anontown.entities.profile.Profile
import com.anontown.entities.user.UserId

@finalAlg
trait ProfileRepositoryAlg[F[_]] {
  def findOne(id: ProfileId): EitherT[F, AtError, Profile];
  def find(
      ids: Option[List[ProfileId]],
      users: Option[List[UserId]]
  ): EitherT[F, AtError, List[Profile]];
  def insert(profile: Profile): EitherT[F, AtError, Unit];
  def update(profile: Profile): EitherT[F, AtError, Unit];
}
