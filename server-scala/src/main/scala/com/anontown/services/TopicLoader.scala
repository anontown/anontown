package com.anontown.services

import cats.tagless.finalAlg
import com.anontown.entities.topic.UntaggedTopicId
import cats.data.EitherT
import com.anontown.AtError
import com.anontown.entities.topic.Topic

@finalAlg
trait TopicLoaderAlg[F[_]] {
  def load(id: UntaggedTopicId): EitherT[F, AtError, Topic];
  def loadMany(ids: List[UntaggedTopicId]): EitherT[F, AtError, List[Topic]];
}
