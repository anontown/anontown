package com.anontown.services

import cats.tagless.finalAlg
import com.anontown.entities.res.UntaggedResId
import cats.data.EitherT
import com.anontown.AtError
import com.anontown.entities.res.Res

@finalAlg
trait ResLoaderAlg[F[_]] {
  def load(id: UntaggedResId): EitherT[F, AtError, Res];
  def loadMany(ids: List[UntaggedResId]): EitherT[F, AtError, List[Res]];
}
