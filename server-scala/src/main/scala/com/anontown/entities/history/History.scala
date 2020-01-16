package com.anontown.entities.history

import java.time.OffsetDateTime
import cats._, cats.implicits._, cats.derived._
import com.anontown.utils.Impl._;
import zio.ZIO
import com.anontown.ports.ObjectIdGeneratorComponent
import com.anontown.ports.ClockComponent
import com.anontown.AuthToken
import com.anontown.AtServerError
import com.anontown.entities.user.{UserId, User}

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
  implicit val eqImpl: Eq[HistoryAPI] = {
    import auto.eq._
    semi.eq
  }
}

final case class History(
    id: HistoryId,
    topic: String,
    title: String,
    tags: List[String],
    text: String,
    date: OffsetDateTime,
    hash: String,
    user: UserId
) {
  def toAPI(authToken: Option[AuthToken]): HistoryAPI = {
    HistoryAPI(
      id = this.id.value,
      topicID = this.topic,
      title = this.title,
      tags = this.tags,
      text = this.text,
      date = this.date.toString(),
      hash = this.hash,
      self = authToken.map(_.user === this.user)
    )
  }
}

object History {
  implicit val eqImpl: Eq[History] = {
    import auto.eq._
    semi.eq
  }

  def create(
      topicId: String,
      title: String,
      tags: List[String],
      text: String,
      hash: String,
      user: User
  ): ZIO[
    ObjectIdGeneratorComponent with ClockComponent,
    AtServerError,
    History
  ] = {
    for {
      id <- ZIO.accessM[ObjectIdGeneratorComponent](
        _.objectIdGenerator.generateObjectId()
      )
      date <- ZIO.access[ClockComponent](_.clock.requestDate)
    } yield History(
      id = HistoryId(id),
      topic = topicId,
      title = title,
      tags = tags,
      text = text,
      date = date,
      hash = hash,
      user = user.id
    )
  }
}
