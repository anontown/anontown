package com.anontown.ports;

import cats.tagless._
import cats.Monad
import com.anontown.entities.DateTime

@finalAlg
trait ClockAlg[F[_]] {
  def getRequestDate(): F[DateTime];
}

class ClockImpl[F[_]: Monad](val requestDate: DateTime) extends ClockAlg[F] {
  def getRequestDate(): F[DateTime] = {
    Monad[F].pure(requestDate)
  }
}
