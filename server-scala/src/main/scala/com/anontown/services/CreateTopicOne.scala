package com.anontown.services

import cats.tagless.finalAlg
import cats.data.EitherT
import com.anontown.AtError
import com.anontown.entities.topic.TopicOne
import cats.Monad
import com.anontown.ports.AuthContainerAlg
import com.anontown.ports.ObjectIdGeneratorAlg
import com.anontown.ports.ClockAlg
import com.anontown.ports.TopicRepositoryAlg
import com.anontown.ports.UserRepositoryAlg
import com.anontown.ports.ResRepositoryAlg
import com.anontown.ports.ConfigContainerAlg

@finalAlg
trait CreateTopicOneAlg[F[_]] {
  def run(
      title: String,
      tags: List[String],
      text: String
  ): EitherT[F, AtError, TopicOne];
}

class CreateTopicOne[F[_]: Monad: AuthContainerAlg: ObjectIdGeneratorAlg: ClockAlg: TopicRepositoryAlg: UserRepositoryAlg: ResRepositoryAlg: MutationLoggerAlg: ConfigContainerAlg: HashAlg]
    extends CreateTopicOneAlg[F] {
  def run(
      title: String,
      tags: List[String],
      text: String
  ): EitherT[F, AtError, TopicOne] = {
    for {
      auth <- AuthContainerAlg[F].getToken()
      user <- UserRepositoryAlg[F].findOne(auth.user)
      (topic, res, user) <- TopicOne.create[F](title, tags, text, user, auth)
      _ <- TopicRepositoryAlg[F].insert(topic)
      _ <- UserRepositoryAlg[F].update(user)
      _ <- ResRepositoryAlg[F].insert(res)
      _ <- EitherT.right(
        MutationLoggerAlg[F].createLog("topics", topic.id.value)
      )
      _ <- EitherT.right(MutationLoggerAlg[F].createLog("reses", res.id.value))
    } yield topic
  }
}
