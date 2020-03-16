package com.anontown.entities.history

import cats._, cats.implicits._, cats.derived._
import com.anontown.ports.ObjectIdGeneratorAlg
import com.anontown.ports.ClockAlg
import com.anontown.AuthToken
import com.anontown.entities.user.{UserId, User}
import com.anontown.entities.topic.TopicNormalId
import com.anontown.entities.topic.TopicTitle
import com.anontown.entities.topic.TopicTags
import com.anontown.entities.topic.TopicText
import com.anontown.entities.DateTime

final case class HistoryAPI(
    id: String,
    topicID: String,
    title: String,
    tags: List[String],
    text: String,
    date: String,
    hash: String,
    self: Option[Boolean]
);

object HistoryAPI {
  implicit val implEq: Eq[HistoryAPI] = {
    import auto.eq._
    semi.eq
  }
}

final case class History(
    id: HistoryId,
    topic: TopicNormalId,
    title: TopicTitle,
    tags: TopicTags,
    text: TopicText,
    date: DateTime,
    hash: String,
    user: UserId
);

object History {
  implicit val implEq: Eq[History] = {
    import auto.eq._
    semi.eq
  }

  def create[F[_]: Monad: ObjectIdGeneratorAlg: ClockAlg](
      topicId: TopicNormalId,
      title: TopicTitle,
      tags: TopicTags,
      text: TopicText,
      hash: String,
      user: User
  ): F[History] = {
    for {
      id <- ObjectIdGeneratorAlg[F].generateObjectId()
      requestDate <- ClockAlg[F].getRequestDate()
    } yield History(
      id = HistoryId(id),
      topic = topicId,
      title = title,
      tags = tags,
      text = text,
      date = requestDate,
      hash = hash,
      user = user.id
    )
  }

  implicit class HistoryService(val self: History) {
    def toAPI(authToken: Option[AuthToken]): HistoryAPI = {
      HistoryAPI(
        id = self.id.value,
        topicID = self.topic.value,
        title = self.title.value,
        tags = self.tags.value.map(_.value),
        text = self.text.value,
        date = self.date.toString(),
        hash = self.hash,
        self = authToken.map(_.user === self.user)
      )
    }
  }
}
