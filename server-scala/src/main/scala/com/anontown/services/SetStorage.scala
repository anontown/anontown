package com.anontown.services

import cats.tagless.finalAlg
import cats.data.EitherT
import com.anontown.AtError
import com.anontown.entities.storage.Storage
import cats.Monad
import com.anontown.ports.AuthContainerAlg
import com.anontown.ports.StorageRepositoryAlg

@finalAlg
trait SetStorageAlg[F[_]] {
  def run(key: String, value: String): EitherT[F, AtError, Storage];
}

class SetStorage[F[_]: Monad: AuthContainerAlg: StorageRepositoryAlg]
    extends SetStorageAlg[F] {
  def run(key: String, value: String): EitherT[F, AtError, Storage] = {
    for {
      auth <- AuthContainerAlg[F].getToken()
      storage <- Storage.create(auth, key, value)
      _ <- StorageRepositoryAlg[F].save(storage)
    } yield storage
  }
}
