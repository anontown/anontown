package com.anontown.ports;

import cats.tagless._

@finalAlg
trait ObjectIdGeneratorAlg[F[_]] {
  def generateObjectId(): F[String];
}
