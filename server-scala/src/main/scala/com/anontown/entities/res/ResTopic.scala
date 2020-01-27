package com.anontown.entities.res

import java.time.OffsetDateTime
import cats._, cats.implicits._, cats.derived._
import com.anontown.AtError
import com.anontown.services.ObjectIdGeneratorAlg
import com.anontown.services.ClockAlg
import com.anontown.AuthToken
import monocle.macros.syntax.lens._
import shapeless._
import com.anontown.entities.user.{UserId, User}
import com.anontown.entities.topic.{TopicTemporaryId, TopicTemporary}
import com.anontown.entities.topic.Topic.TopicService
import com.anontown.entities.topic.Topic.ops._
import Res.ResService
import cats.data.EitherT
import com.anontown.services.ConfigContainerAlg

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
);

object ResTopic {
  implicit def implRes[TopicArg: TopicTemporaryId]: Res[ResTopic[TopicArg]] {
    type IdType = ResTopicId;
    type TopicIdType = TopicArg
    type API = ResTopicAPI
  } =
    new Res[ResTopic[TopicArg]] {
      type IdType = ResTopicId;
      val implResIdForIdType = implicitly

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

      override def toAPI(
          self: Self
      )(authToken: Option[AuthToken]): API = {
        LabelledGeneric[ResTopicAPI].from(
          self
            .resAPIIntrinsicProperty(authToken)
        )
      }
    }

  def create[F[_]: Monad: ObjectIdGeneratorAlg: ClockAlg: ConfigContainerAlg, TopicTemporaryType](
      topic: TopicTemporaryType,
      user: User,
      authUser: AuthToken
  )(implicit implTopicTemporary: TopicTemporary[TopicTemporaryType]): EitherT[
    F,
    AtError,
    (ResTopic[implTopicTemporary.IdType], TopicTemporaryType)
  ] = {
    assert(user.id === authUser.user);

    import implTopicTemporary.implTopicIdForIdType

    for {
      requestDate <- EitherT.right(ClockAlg[F].getRequestDate())
      id <- EitherT.right(
        ObjectIdGeneratorAlg[F].generateObjectId()
      )

      hash <- EitherT.right(topic.hash[F](user))

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
      newTopic <- EitherT.fromEither[F](topic.resUpdate(result, false))
    } yield (result, newTopic)
  }
}
