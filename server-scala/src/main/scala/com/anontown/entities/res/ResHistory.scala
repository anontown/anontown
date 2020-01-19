package com.anontown.entities.res

import java.time.OffsetDateTime
import cats._, cats.implicits._, cats.derived._
import zio.ZIO
import com.anontown.AtError
import com.anontown.ports.ObjectIdGeneratorComponent
import com.anontown.ports.ClockComponent
import com.anontown.AuthToken
import monocle.macros.syntax.lens._
import shapeless._
import record._
import com.anontown.entities.user.{UserId, User}
import com.anontown.entities.topic.{TopicNormalId, TopicNormal}
import com.anontown.entities.history.{HistoryId, History}
import com.anontown.entities.topic.Topic.TopicService

final case class ResHistoryAPI(
    id: String,
    topicID: String,
    date: String,
    self: Option[Boolean],
    uv: Int,
    dv: Int,
    hash: String,
    replyCount: Int,
    voteFlag: Option[VoteFlag],
    historyID: String
) extends ResAPI;

object ResHistoryAPI {
  implicit val eqImpl: Eq[ResHistoryAPI] = {
    import auto.eq._
    semi.eq
  }
}

final case class ResHistory(
    id: ResHistoryId,
    topic: TopicNormalId,
    date: OffsetDateTime,
    user: UserId,
    votes: List[Vote],
    lv: Int,
    hash: String,
    replyCount: Int,
    history: HistoryId
);

object ResHistory {
  implicit val resImpl = new Res[ResHistory] {
    type IdType = ResHistoryId;
    val idTypeImpls = new IdTypeImpls()
    type TopicIdType = TopicNormalId;
    type API = ResHistoryAPI

    override def id(self: Self) = self.lens(_.id)
    override def topic(self: Self) = self.lens(_.topic)
    override def date(self: Self) = self.lens(_.date)
    override def user(self: Self) = self.lens(_.user)
    override def votes(self: Self) = self.lens(_.votes)
    override def lv(self: Self) = self.lens(_.lv)
    override def hash(self: Self) = self.lens(_.hash)
    override def replyCount(self: Self) =
      self.lens(_.replyCount)

    override def fromBaseAPI(
        self: Self
    )(authToken: Option[AuthToken], base: ResAPIBaseRecord): API = {
      LabelledGeneric[ResHistoryAPI].from(
        base.merge(
          Record(
            historyID = self.history.value
          )
        )
      )
    }
  }

  def create(
      topic: TopicNormal,
      user: User,
      authUser: AuthToken,
      history: History
  ): ZIO[
    ObjectIdGeneratorComponent with ClockComponent,
    AtError,
    (ResHistory, TopicNormal)
  ] = {
    assert(user.id === authUser.user);
    for {
      requestDate <- ZIO.access[ClockComponent](_.clock.requestDate)
      id <- ZIO.accessM[ObjectIdGeneratorComponent](
        _.objectIdGenerator.generateObjectId()
      )

      hash <- ZIO.access[ClockComponent](topic.hash(user)(_))

      val result = ResHistory(
        history = history.id,
        id = ResHistoryId(id),
        topic = topic.id,
        date = requestDate,
        user = user.id,
        votes = List(),
        lv = user.lv * 5,
        hash = hash,
        replyCount = 0
      )
      newTopic <- ZIO.fromEither(topic.resUpdate(result))
    } yield (result, newTopic)
  }
}
