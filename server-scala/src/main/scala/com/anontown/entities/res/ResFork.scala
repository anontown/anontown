package com.anontown.entities.res

import java.time.OffsetDateTime
import cats._, cats.implicits._, cats.derived._
import zio.ZIO
import com.anontown.AtError
import com.anontown.services.ObjectIdGeneratorComponent
import com.anontown.services.ClockComponent
import com.anontown.AuthToken
import monocle.macros.syntax.lens._
import shapeless._
import record._
import com.anontown.entities.user.{UserId, User}
import com.anontown.entities.topic.{
  TopicNormalId,
  TopicNormal,
  TopicForkId,
  TopicFork
}
import com.anontown.entities.topic.Topic.TopicService
import Res.ResService

final case class ResForkAPI(
    id: String,
    topicID: String,
    date: String,
    self: Option[Boolean],
    uv: Int,
    dv: Int,
    hash: String,
    replyCount: Int,
    voteFlag: Option[VoteFlag],
    forkID: String
) extends ResAPI;

object ResForkAPI {
  implicit val implEq: Eq[ResForkAPI] = {
    import auto.eq._
    semi.eq
  }
}

final case class ResFork(
    id: ResForkId,
    topic: TopicNormalId,
    date: OffsetDateTime,
    user: UserId,
    votes: List[Vote],
    lv: Int,
    hash: String,
    replyCount: Int,
    fork: TopicForkId
);

object ResFork {
  implicit val implRes: Res[ResFork] {
    type IdType = ResForkId;
    type TopicIdType = TopicNormalId;
    type API = ResForkAPI
  } = new Res[ResFork] {
    type IdType = ResForkId;
    val implResIdForIdType = implicitly
    type TopicIdType = TopicNormalId;
    val implTopicIdForTopicIdType = implicitly

    type API = ResForkAPI

    override def id(self: Self) = self.lens(_.id)
    override def topic(self: Self) = self.lens(_.topic)
    override def date(self: Self) = self.lens(_.date)
    override def user(self: Self) = self.lens(_.user)
    override def votes(self: Self) = self.lens(_.votes)
    override def lv(self: Self) = self.lens(_.lv)
    override def hash(self: Self) = self.lens(_.hash)
    override def replyCount(self: Self) =
      self.lens(_.replyCount)

    override def toAPI(
        self: Self
    )(authToken: Option[AuthToken]): API = {
      LabelledGeneric[ResForkAPI].from(
        self
          .resAPIIntrinsicProperty(authToken)
          .merge(Record(forkID = self.fork.value))
      )
    }
  }

  def create(
      topic: TopicNormal,
      user: User,
      authUser: AuthToken,
      fork: TopicFork
  ): ZIO[
    ObjectIdGeneratorComponent with ClockComponent,
    AtError,
    (ResFork, TopicNormal)
  ] = {
    assert(user.id === authUser.user);
    for {
      requestDate <- ZIO.access[ClockComponent](_.clock.requestDate)
      id <- ZIO.accessM[ObjectIdGeneratorComponent](
        _.objectIdGenerator.generateObjectId()
      )

      hash <- ZIO.access[ClockComponent](topic.hash(user)(_))

      val result = ResFork(
        fork = fork.id,
        id = ResForkId(id),
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
