package com.anontown.services

import cats.tagless.finalAlg
import com.anontown.entities.topic.UntaggedTopicId
import cats.data.EitherT
import com.anontown.AtError
import com.anontown.entities.topic.Topic
import com.anontown.entities.topic.TagUsage
import com.anontown.entities.topic.TopicId
import com.anontown.entities.topic.TopicTag
import com.anontown.entities.topic.TopicNormalId

@finalAlg
trait TopicRepositoryAlg[F[_]] {
  def findOne(id: UntaggedTopicId): EitherT[F, AtError, Topic];
  def findTags(limit: Int): EitherT[F, AtError, List[TagUsage]];
  def insert(topic: Topic): EitherT[F, AtError, Unit];
  def update(topic: Topic): EitherT[F, AtError, Unit];
  def cronTopicCheck(): EitherT[F, AtError, Unit];
  def find(
      id: Option[List[TopicId]],
      title: Option[String],
      tags: Option[List[TopicTag]],
      activeOnly: Boolean,
      parent: Option[TopicNormalId],
      skip: Int,
      limit: Int
  ): EitherT[F, AtError, List[Topic]]
}
