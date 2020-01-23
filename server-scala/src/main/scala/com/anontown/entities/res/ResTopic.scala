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
import com.anontown.entities.topic.{TopicTemporaryId, TopicTemporary}
import com.anontown.entities.topic.Topic.TopicService
import com.anontown.entities.topic.Topic.ops._

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
  implicit val implEq: Eq[ResTopicAPI] = {
    import auto.eq._
    semi.eq
  }
}

final case class ResTopic[TopicArg](
    id: ResTopicId,
    topic: TopicArg,
    date: OffsetDateTime,
    user: UserId,
    votes: List[Vote],
    lv: Int,
    hash: String,
    replyCount: Int
) {
  type Self = ResTopic[TopicArg];
  type IdType = ResTopicId;
  type TopicIdType = TopicArg;
}

object ResTopic {
  implicit def resImpl[TopicArg: TopicTemporaryId] =
    new Res[ResTopic[TopicArg]] {
      type IdType = ResTopicId;
      val idTypeImpls = new IdTypeImpls()

      type TopicIdType = TopicArg
      val implTopicIdForTopicIdType = implicitly

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
      )(authToken: Option[AuthToken], base: ResAPIBaseRecord): API = {
        LabelledGeneric[ResTopicAPI].from(base)
      }
    }

  def create[TopicTemporaryType](
      topic: TopicTemporaryType,
      user: User,
      authUser: AuthToken
  )(implicit implTopicTemporary: TopicTemporary[TopicTemporaryType]): ZIO[
    ObjectIdGeneratorComponent with ClockComponent,
    AtError,
    (ResTopic[implTopicTemporary.IdType], TopicTemporaryType)
  ] = {
    assert(user.id === authUser.user);

    import implTopicTemporary.topicIdImplIdType

    for {
      requestDate <- ZIO.access[ClockComponent](_.clock.requestDate)
      id <- ZIO.accessM[ObjectIdGeneratorComponent](
        _.objectIdGenerator.generateObjectId()
      )

      hash <- ZIO.access[ClockComponent](topic.hash(user)(_))

      val result = ResTopic(
        id = ResTopicId(id),
        topic = topic.id.get,
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
