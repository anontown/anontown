package com.anontown.services

import cats.tagless.finalAlg
import cats.data.EitherT
import com.anontown.AtError;
import com.anontown.entities.topic.TopicNormal
import cats.Monad
import com.anontown.ports.UserRepositoryAlg
import com.anontown.ports.ObjectIdGeneratorAlg
import com.anontown.ports.AuthContainerAlg
import com.anontown.ports.ClockAlg
import com.anontown.ports.ResRepositoryAlg
import com.anontown.ports.HistoryRepositoryAlg
import com.anontown.ports.ConfigContainerAlg
import com.anontown.ports.TopicRepositoryAlg

@finalAlg
trait CreateTopicNormalAlg[F[_]] {
  def run(
      title: String,
      tags: List[String],
      text: String
  ): EitherT[F, AtError, TopicNormal];
}

class CreateTopicNormal[F[_]: Monad: UserRepositoryAlg: ObjectIdGeneratorAlg: AuthContainerAlg: ClockAlg: ResRepositoryAlg: HistoryRepositoryAlg: MutationLoggerAlg: ConfigContainerAlg: TopicRepositoryAlg]
    extends CreateTopicNormalAlg[F] {
  def run(
      title: String,
      tags: List[String],
      text: String
  ): EitherT[F, AtError, TopicNormal] = {
    for {
      auth <- AuthContainerAlg[F].getToken()
      user <- UserRepositoryAlg[F].findOne(auth.user)
      (topic, history, resHistory, user) <- TopicNormal
        .create[F](title, tags, text, user, auth)
      _ <- TopicRepositoryAlg[F].insert(topic)
      _ <- UserRepositoryAlg[F].update(user)
      _ <- ResRepositoryAlg[F].insert(resHistory)
      _ <- HistoryRepositoryAlg[F].insert(history)
      _ <- EitherT.right(
        MutationLoggerAlg[F].createLog("topics", topic.id.value)
      )
      _ <- EitherT.right(
        MutationLoggerAlg[F].createLog("reses", resHistory.id.value)
      )
      _ <- EitherT.right(
        MutationLoggerAlg[F].createLog("histories", history.id.value)
      )
    } yield topic
  }
}
