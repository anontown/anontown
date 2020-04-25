package com.anontown.services

import cats.data.EitherT
import com.anontown.AtError
import com.anontown.entities.topic.TopicFork
import cats.tagless.finalAlg
import cats.Monad
import com.anontown.ports.AuthContainerAlg
import com.anontown.ports.UserRepositoryAlg
import com.anontown.ports.TopicRepositoryAlg
import com.anontown.ports.ObjectIdGeneratorAlg
import com.anontown.ports.ClockAlg
import com.anontown.ports.ResRepositoryAlg
import com.anontown.ports.ConfigContainerAlg
import com.anontown.entities.topic.UntaggedTopicId
import com.anontown.AtNotFoundError

@finalAlg
trait CreateTopicForkAlg[F[_]] {
  def run(parent: String, title: String): EitherT[F, AtError, TopicFork];
}

class CreateTopicFork[F[_]: Monad: AuthContainerAlg: UserRepositoryAlg: TopicRepositoryAlg: ObjectIdGeneratorAlg: ClockAlg: ResRepositoryAlg: MutationLoggerAlg: ConfigContainerAlg: HashAlg]
    extends CreateTopicForkAlg[F] {
  def run(parent: String, title: String): EitherT[F, AtError, TopicFork] = {
    for {
      auth <- AuthContainerAlg[F].getToken()
      user <- UserRepositoryAlg[F].findOne(auth.user)
      parent <- TopicRepositoryAlg[F].findOne(UntaggedTopicId(parent))
      parent <- EitherT.fromEither[F](
        parent.asTopicNormal
          .map(Right(_))
          .getOrElse(Left(new AtNotFoundError("トピックが見つかりません"): AtError))
      )

      (topic, resTopic, resFork, user, parent) <- TopicFork
        .create[F](title, parent, user, auth)

      _ <- TopicRepositoryAlg[F].insert(topic)
      _ <- TopicRepositoryAlg[F].update(parent)
      _ <- UserRepositoryAlg[F].update(user)
      _ <- ResRepositoryAlg[F].insert(resTopic)
      _ <- ResRepositoryAlg[F].insert(resFork)

      _ <- EitherT.right(
        MutationLoggerAlg[F].createLog("topics", topic.id.value)
      )

      _ <- EitherT.right(
        MutationLoggerAlg[F].createLog("reses", resFork.id.value)
      )

      _ <- EitherT.right(
        MutationLoggerAlg[F].createLog("reses", resTopic.id.value)
      )
    } yield topic
  }
}
