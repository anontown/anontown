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
import com.anontown.entities.user.{UserId, User}
import com.anontown.entities.topic.{Topic, TopicTemporaryId, TopicTemporary}

final case class ResTopicAPI(
    id: String,
    topicID: String,
    date: String,
    self: Option[Boolean],
    uv: Int,
    dv: Int,
    hash: String,
    replyCount: Int,
    voteFlag: Option[VoteFlag]
) extends ResAPI;

object ResTopicAPI {
  implicit val eqImpl: Eq[ResTopicAPI] = {
    import auto.eq._
    semi.eq
  }
}

final case class ResTopic(
    id: ResTopicId,
    topic: TopicTemporaryId,
    date: OffsetDateTime,
    user: UserId,
    votes: List[Vote],
    lv: Int,
    hash: String,
    replyCount: Int
) {
  type Self = ResTopic;
  type IdType = ResTopicId;
  type TopicIdType = TopicTemporaryId;
}

object ResTopic {
  implicit val resImpl = new Res[ResTopic] {
    type IdType = ResTopicId;
    type TopicIdType = TopicTemporaryId;
    type API = ResTopicAPI

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
    )(authToken: Option[AuthToken], base: ResBaseAPIRecord): API = {
      LabelledGeneric[ResTopicAPI].from(base)
    }
  }

  // TODO: TopicOne | TopicForkを受け取ってそれをかえす
  def create(
      topic: TopicTemporary,
      user: User,
      authUser: AuthToken
  ): ZIO[
    ObjectIdGeneratorComponent with ClockComponent,
    AtError,
    (ResTopic, Topic)
  ] = {
    assert(user.id === authUser.user);
    for {
      requestDate <- ZIO.access[ClockComponent](_.clock.requestDate)
      id <- ZIO.accessM[ObjectIdGeneratorComponent](
        _.objectIdGenerator.generateObjectId()
      )

      hash <- ZIO.access[ClockComponent](topic.hash(user)(_))

      val result = ResTopic(
        id = ResTopicId(id),
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
