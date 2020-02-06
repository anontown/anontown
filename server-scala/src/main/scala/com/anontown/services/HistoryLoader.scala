package com.anontown.services

import cats.tagless._
import cats.data.EitherT
import com.anontown.AtError
import com.anontown.entities.history.{History, HistoryId}

@finalAlg
trait HistoryLoaderAlg[F[_]] {
  def load(id: HistoryId): EitherT[F, AtError, History];
  def loadMany(ids: List[HistoryId]): EitherT[F, AtError, List[History]];
}
