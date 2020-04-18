package com.anontown.services

import cats.tagless.finalAlg
import cats.data.EitherT
import com.anontown.AtError
import com.anontown.entities.res.ResNormal
import com.anontown.entities.res.TaggedResId
import com.anontown.entities.topic.TaggedTopicId
import cats.Monad
import com.anontown.ports.TopicRepositoryAlg
import com.anontown.entities.topic.UntaggedTopicId
import com.anontown.ports.UserRepositoryAlg
import com.anontown.ports.AuthContainerAlg
import com.anontown.ports.ResRepositoryAlg
import com.anontown.entities.res.UntaggedResId
import cats.implicits._
import com.anontown.ports.ProfileRepositoryAlg
import com.anontown.entities.profile.ProfileId
import com.anontown.entities.res.Res
import com.anontown.entities.topic.Topic
import com.anontown.ports.ObjectIdGeneratorAlg
import com.anontown.ports.ClockAlg
import com.anontown.ports.ConfigContainerAlg

@finalAlg
trait CreateResAlg[F[_]] {
  def run(
      topic: String,
      name: Option[String],
      text: String,
      reply: Option[String],
      profile: Option[String],
      age: Boolean
  ): EitherT[F, AtError, ResNormal[TaggedTopicId, TaggedResId]];
}

class CreateRes[F[_]: Monad: TopicRepositoryAlg: UserRepositoryAlg: AuthContainerAlg: ResRepositoryAlg: ProfileRepositoryAlg: ObjectIdGeneratorAlg: ClockAlg: ConfigContainerAlg: MutationLoggerAlg: HashAlg]
    extends CreateResAlg[F] {
  def run(
      topic: String,
      name: Option[String],
      text: String,
      reply: Option[String],
      profile: Option[String],
      age: Boolean
  ): EitherT[F, AtError, ResNormal[TaggedTopicId, TaggedResId]] = {
    for {
      topic <- TopicRepositoryAlg[F].findOne(UntaggedTopicId(topic))
      auth <- AuthContainerAlg[F].getToken()
      user <- UserRepositoryAlg[F].findOne(auth.user)
      reply <- reply
        .map(reply => ResRepositoryAlg[F].findOne(UntaggedResId(reply)))
        .sequence
      profile <- profile
        .map(profile => ProfileRepositoryAlg[F].findOne(ProfileId(profile)))
        .sequence

      (res, user, topic) <- ResNormal.create[F, TaggedResId, Res, Topic](
        topic,
        user,
        auth,
        name,
        text,
        reply,
        profile,
        age
      )

      _ <- ResRepositoryAlg[F].insert(res)
      _ <- TopicRepositoryAlg[F].update(topic)
      _ <- UserRepositoryAlg[F].insert(user)

      _ <- EitherT.right(MutationLoggerAlg[F].createLog("reses", res.id.value))
    } yield res.topicIdWiden
  }
}
