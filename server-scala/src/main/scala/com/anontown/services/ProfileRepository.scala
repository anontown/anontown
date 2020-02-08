package com.anontown.services

import cats.tagless.finalAlg
import cats.data.EitherT
import com.anontown.entities.profile.{Profile, ProfileId}
import com.anontown.AtError
import org.scalactic.Bool

@finalAlg
trait ProfileRepositoryAlg[F[_]] {
  def findOne(id: ProfileId): EitherT[F, AtError, Profile]
  def find(
      id: Option[List[ProfileId]],
      self: Option[Bool]
  ): EitherT[F, AtError, List[Profile]]
  def insert(profile: Profile): EitherT[F, AtError, Unit]
  def update(profile: Profile): EitherT[F, AtError, Unit]
}
