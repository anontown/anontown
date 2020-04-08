package com.anontown.services

import cats.tagless.finalAlg
import cats.Monad
import cats.implicits._
import com.anontown.ports.LoggerAlg
import com.anontown.ports.IpContainerAlg

@finalAlg
trait MutationLoggerAlg[F[_]] {
  def createLog(name: String, id: String): F[Unit];
  def updateLog(name: String, id: String): F[Unit];
}

class MutationLogger[F[_]: Monad: LoggerAlg: IpContainerAlg]
    extends MutationLoggerAlg[F] {
  def createLog(name: String, id: String): F[Unit] = {
    for {
      ip <- IpContainerAlg[F].getRequestIp()
      _ <- LoggerAlg[F].info(
        f"create: ${ip.getOrElse("<unknown_ip>")} ${name} ${id}"
      )
    } yield ()
  }
  def updateLog(name: String, id: String): F[Unit] = {
    for {
      ip <- IpContainerAlg[F].getRequestIp()
      _ <- LoggerAlg[F].info(
        f"update: ${ip.getOrElse("<unknown_ip>")} ${name} ${id}"
      )
    } yield ()
  }
}
