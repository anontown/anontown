package com.anontown.ports

import cats.tagless.finalAlg
import cats.data.EitherT
import com.anontown.AtServerError
import com.anontown.entities.res.Res

@finalAlg
trait ResEventPublisherAlg[F[_]] {
  def publishAddRes(res: Res): EitherT[F, AtServerError, Unit];
}
