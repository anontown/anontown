package com.anontown.ports
import cats.tagless._

@finalAlg
trait SafeIdGeneratorAlg[F[_]] {
  def generateSafeId(): F[String];
}
