package com.anontown.ports

import cats.tagless.finalAlg
import com.anontown.AuthToken
import cats.data.EitherT
import com.anontown.AtError
import com.anontown.entities.storage.Storage
import com.anontown.entities.storage.StorageKey
import com.anontown.entities.token.Token

@finalAlg
trait StorageRepositoryAlg[F[_]] {
  def findOneKey(
      token: AuthToken,
      key: StorageKey
  ): EitherT[F, AtError, Storage];
  def find(
      token: Token,
      key: Option[StorageKey]
  ): EitherT[F, AtError, List[Storage]];
  def save(storage: Storage): EitherT[F, AtError, Unit];
  def del(storage: Storage): EitherT[F, AtError, Unit];
}
