package com.anontown.entities.res

import java.time.OffsetDateTime
import cats._, cats.implicits._, cats.derived._
import com.anontown.AtError
import com.anontown.services.ObjectIdGeneratorAlg
import com.anontown.services.ClockAlg
import com.anontown.AuthToken
import monocle.macros.syntax.lens._
import shapeless._
import record._
import com.anontown.entities.user.{UserId, User}
import com.anontown.entities.topic.{TopicNormalId, TopicNormal}
import com.anontown.entities.history.{HistoryId, History}
import com.anontown.entities.topic.Topic.TopicService
import Res.ResService
import cats.data.EitherT
import com.anontown.services.ConfigContainerAlg

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
  implicit val implEq: Eq[ResHistoryAPI] = {
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
  implicit val implRes: Res[ResHistory] {
    type IdType = ResHistoryId;
    type TopicIdType = TopicNormalId;
    type API = ResHistoryAPI
  } = new Res[ResHistory] {
    type IdType = ResHistoryId;
    val implResIdForIdType = implicitly
    type TopicIdType = TopicNormalId;
    val implTopicIdForTopicIdType = implicitly

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

    override def toAPI(
        self: Self
    )(authToken: Option[AuthToken]): API = {
      LabelledGeneric[ResHistoryAPI].from(
        self
          .resAPIIntrinsicProperty(authToken)
          .merge(
            Record(
              historyID = self.history.value
            )
          )
      )
    }
  }

  def create[F[_]: Monad: ObjectIdGeneratorAlg: ClockAlg: ConfigContainerAlg](
      topic: TopicNormal,
      user: User,
      authToken: AuthToken,
      history: History
  ): EitherT[
    F,
    AtError,
    (ResHistory, TopicNormal)
  ] = {
    assert(user.id === authToken.user);
    for {
      requestDate <- EitherT.right(ClockAlg[F].getRequestDate())
      id <- EitherT.right(
        ObjectIdGeneratorAlg[F].generateObjectId()
      )

      hash <- EitherT.right(topic.hash[F](user))

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
      newTopic <- EitherT.fromEither[F](topic.resUpdate(result, false))
    } yield (result, newTopic)
  }
}
