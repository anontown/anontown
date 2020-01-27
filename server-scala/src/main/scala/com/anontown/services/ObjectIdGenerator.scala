package com.anontown.services;

import cats.tagless._

@finalAlg
trait ObjectIdGeneratorAlg[F[_]] {
  def generateObjectId(): F[String];
}
