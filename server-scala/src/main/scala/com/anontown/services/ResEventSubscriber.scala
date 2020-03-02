package com.anontown.services

import cats.tagless.finalAlg
import cats.data.EitherT
import com.anontown.AtServerError
import com.anontown.entities.res.Res

@finalAlg
trait ResEventSubscriberAlg[F[_], G[_]] {
  def subscribeAddRes(): EitherT[F, AtServerError, G[Res]];
}
