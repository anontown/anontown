package com.anontown.services

import cats.data.EitherT
import com.anontown.AtError
import cats.Monad
import com.anontown.ports.StorageRepositoryAlg
import com.anontown.ports.AuthContainerAlg
import com.anontown.entities.storage.StorageKey

trait DelStorageAlg[F[_]] {
  def run(key: String): EitherT[F, AtError, Unit];
}

class DelStorage[F[_]: Monad: StorageRepositoryAlg: AuthContainerAlg]
    extends DelStorageAlg[F] {
  def run(key: String): EitherT[F, AtError, Unit] = {
    for {
      auth <- AuthContainerAlg[F].getToken()
      storage <- StorageRepositoryAlg[F].findOneKey(auth, StorageKey(key))
      _ <- StorageRepositoryAlg[F].del(storage)
    } yield ()
  }
}
