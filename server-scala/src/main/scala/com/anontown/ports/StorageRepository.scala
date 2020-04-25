package com.anontown.ports

import cats.tagless.finalAlg
import cats.data.EitherT
import com.anontown.AtError
import com.anontown.entities.storage.Storage
import com.anontown.entities.storage.StorageKey
import com.anontown.entities.user.UserId
import com.anontown.entities.client.ClientId

@finalAlg
trait StorageRepositoryAlg[F[_]] {
  def findOneByKey(
      userId: UserId,
      clientId: Option[ClientId],
      key: StorageKey
  ): EitherT[F, AtError, Storage];
  def find(
      userId: UserId,
      clientId: Option[ClientId],
      keys: Option[List[StorageKey]]
  ): EitherT[F, AtError, List[Storage]];
  def save(storage: Storage): EitherT[F, AtError, Unit];
  def del(storage: Storage): EitherT[F, AtError, Unit];
}
