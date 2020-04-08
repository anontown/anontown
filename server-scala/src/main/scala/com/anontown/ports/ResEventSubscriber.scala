package com.anontown.ports

import cats.tagless.finalAlg
import cats.data.EitherT
import com.anontown.AtServerError
import com.anontown.entities.res.Res
import fs2.Stream

@finalAlg
trait ResEventSubscriberAlg[F[_]] {
  def subscribeAddRes(): Stream[F, Res];
}
