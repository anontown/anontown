package com.anontown.services;

import java.time.OffsetDateTime;
import cats.tagless._
import cats.Monad

@finalAlg
trait ClockAlg[F[_]] {
  def getRequestDate(): F[OffsetDateTime];
}

class ClockImpl[F[_]: Monad](val requestDate: OffsetDateTime)
    extends ClockAlg[F] {
  def getRequestDate(): F[OffsetDateTime] = {
    Monad[F].pure(requestDate)
  }
}
