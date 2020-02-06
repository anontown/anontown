package com.anontown.services

import cats.tagless.finalAlg
import cats.data.EitherT
import com.anontown.entities.msg.{MsgId, Msg}
import com.anontown.AtError
import com.anontown.AuthToken

@finalAlg
trait MsgRepositoryAlg[F[_]] {
  def findOne(id: MsgId): EitherT[F, AtError, Msg]
  def insert(msg: Msg): EitherT[F, AtError, Unit]
  def update(msg: Msg): EitherT[F, AtError, Unit]
  def find(
      authToken: AuthToken,
      id: Option[List[MsgId]],
      date: Option[DateQuery],
      limit: Int
  ): EitherT[F, AtError, List[Msg]]
}
