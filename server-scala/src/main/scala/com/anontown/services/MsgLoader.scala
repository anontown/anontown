package com.anontown.services

import cats.tagless.finalAlg
import cats.data.EitherT
import com.anontown.entities.msg.{MsgId, Msg}
import com.anontown.AtError

@finalAlg
trait MsgLoaderAlg[F[_]] {
  def load(id: MsgId): EitherT[F, AtError, Msg];
  def loadMany(ids: List[MsgId]): EitherT[F, AtError, List[Msg]];
}
