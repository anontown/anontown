package com.anontown.ports

import cats.tagless.finalAlg
import com.anontown.entities.user.UserId
import cats.data.EitherT
import com.anontown.AtError
import com.anontown.entities.user.UserSn
import com.anontown.entities.user.User
import com.anontown.entities.user.ResWaitCountKey

@finalAlg
trait UserRepositoryAlg[F[_]] {
  def findOne(id: UserId): EitherT[F, AtError, User];
  def findID(sn: UserSn): EitherT[F, AtError, UserId];
  def insert(user: User): EitherT[F, AtError, Unit];
  def update(user: User): EitherT[F, AtError, Unit];
  def cronPointReset(): EitherT[F, AtError, Unit];
  def cronCountReset(key: ResWaitCountKey): EitherT[F, AtError, Unit];
}
