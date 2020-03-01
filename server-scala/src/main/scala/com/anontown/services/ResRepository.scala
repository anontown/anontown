package com.anontown.services

import cats.tagless.finalAlg
import com.anontown.entities.res.UntaggedResId
import cats.data.EitherT
import com.anontown.AtError
import com.anontown.entities.res.Res
import com.anontown.entities.topic.UntaggedTopicId
import com.anontown.entities.profile.ProfileId

@finalAlg
trait ResRepositoryAlg[F[_]] {
  def findOne(id: UntaggedResId): EitherT[F, AtError, Res];
  def insert(res: Res): EitherT[F, AtError, Unit];
  def update(res: Res): EitherT[F, AtError, Unit];
  def resCount(
      topicIDs: List[UntaggedTopicId]
  ): EitherT[F, AtError, Map[UntaggedTopicId, Int]];
  def replyCount(
      resIds: List[UntaggedResId]
  ): EitherT[F, AtError, Map[UntaggedResId, Int]];
  def find(
      id: Option[List[UntaggedResId]],
      topic: Option[UntaggedTopicId],
      notice: Boolean,
      hash: Option[String],
      reply: Option[UntaggedResId],
      profile: Option[ProfileId],
      self: Boolean,
      text: Option[String],
      date: Option[DateQuery],
      limit: Int
  ): EitherT[F, AtError, List[Res]];
}
