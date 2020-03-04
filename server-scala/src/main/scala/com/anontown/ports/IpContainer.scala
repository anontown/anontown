package com.anontown.ports;

import cats.tagless._

@finalAlg
trait IpContainerAlg[F[_]] {
  def getRequestIp(): F[Option[String]];
}
