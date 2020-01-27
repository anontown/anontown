package com.anontown.services

import com.anontown.Config
import cats.tagless._
import cats.Monad

@finalAlg
trait ConfigContainerAlg[F[_]] {
  def getConfig(): F[Config];
}

class ConfigContainerImpl[F[_]: Monad](val config: Config)
    extends ConfigContainerAlg[F] {
  def getConfig(): F[Config] = {
    Monad[F].pure(config)
  }
}
