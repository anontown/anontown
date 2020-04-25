package com.anontown.services

import cats.data.EitherT
import com.anontown.AtError
import com.anontown.entities.topic.TopicNormal
import cats.tagless.finalAlg
import cats.Monad
import com.anontown.ports.TopicRepositoryAlg
import com.anontown.ports.UserRepositoryAlg
import com.anontown.ports.ObjectIdGeneratorAlg
import com.anontown.ports.AuthContainerAlg
import com.anontown.ports.ClockAlg
import com.anontown.entities.topic.UntaggedTopicId
import com.anontown.AtNotFoundError
import com.anontown.ports.ConfigContainerAlg
import com.anontown.ports.ResRepositoryAlg
import com.anontown.ports.HistoryRepositoryAlg

@finalAlg
trait UpdateTopicAlg[F[_]] {
  def run(
      id: String,
      title: Option[String],
      tags: Option[List[String]],
      text: Option[String]
  ): EitherT[F, AtError, TopicNormal];
}

class UpdateTopic[F[_]: Monad: TopicRepositoryAlg: UserRepositoryAlg: ObjectIdGeneratorAlg: AuthContainerAlg: ClockAlg: ConfigContainerAlg: ResRepositoryAlg: HistoryRepositoryAlg: MutationLoggerAlg: HashAlg]
    extends UpdateTopicAlg[F] {
  def run(
      id: String,
      title: Option[String],
      tags: Option[List[String]],
      text: Option[String]
  ): EitherT[F, AtError, TopicNormal] = {
    for {
      auth <- AuthContainerAlg[F].getToken()
      topic <- TopicRepositoryAlg[F].findOne(UntaggedTopicId(id))
      topic <- EitherT.fromEither[F](
        topic.asTopicNormal
          .map(Right(_))
          .getOrElse(Left(new AtNotFoundError("トピックが見つかりません"): AtError))
      )
      user <- UserRepositoryAlg[F].findOne(auth.user)
      (topic, resHistory, history, user) <- topic
        .changeData[F](user, auth, title, tags, text)
      _ <- ResRepositoryAlg[F].insert(resHistory)
      _ <- HistoryRepositoryAlg[F].insert(history)
      _ <- TopicRepositoryAlg[F].update(topic)
      _ <- UserRepositoryAlg[F].update(user)

      _ <- EitherT.right(
        MutationLoggerAlg[F].createLog("reses", resHistory.id.value)
      )
      _ <- EitherT.right(
        MutationLoggerAlg[F].createLog("histories", history.id.value)
      )
    } yield topic
  }
}
