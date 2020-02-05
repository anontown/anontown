package com.anontown.entities.topic

import cats._, cats.implicits._, cats.derived._
import com.anontown.utils.Impl._;
import java.time.OffsetDateTime
import monocle.macros.syntax.lens._
import com.anontown.AuthToken
import shapeless._
import record._
import Topic.TopicService
import TopicTemporary.TopicTemporaryService
import cats.data.EitherT
import com.anontown.services.ClockAlg
import com.anontown.services.ObjectIdGeneratorAlg
import com.anontown.entities.user.User
import com.anontown.AtError
import com.anontown.entities.res.{ResTopic, ResFork}
import com.anontown.services.ConfigContainerAlg

final case class TopicForkAPI(
    id: String,
    title: String,
    update: String,
    date: String,
    resCount: Int,
    active: Boolean,
    parentID: String
) extends TopicTemporaryAPI;

object TopicForkAPI {
  implicit val implEq: Eq[TopicForkAPI] = {
    import auto.eq._
    semi.eq
  }
}
final case class TopicFork(
    id: TopicForkId,
    title: TopicTitle,
    update: OffsetDateTime,
    date: OffsetDateTime,
    resCount: Int,
    ageUpdate: OffsetDateTime,
    active: Boolean,
    parent: TopicNormalId
);

object TopicFork {
  implicit val implTopic: TopicTemporary[TopicFork] {
    type IdType = TopicForkId;
    type API = TopicForkAPI;
  } =
    new TopicTemporary[TopicFork] {
      type IdType = TopicForkId;

      val implTopicIdForIdType = implicitly

      type API = TopicForkAPI;

      def toAPI(self: Self)(authToken: Option[AuthToken]): API = {
        LabelledGeneric[TopicForkAPI].from(
          self
            .topicAPIIntrinsicProperty(authToken)
            .merge(
              self
                .topicTemporaryAPIIntrinsicProperty(authToken)
            )
            .merge(Record(parentID = self.parent.value))
        )
      }

      override def id(self: Self) = self.lens(_.id);
      override def title(self: Self) = self.lens(_.title);
      override def update(self: Self) = self.lens(_.update);
      override def date(self: Self) = self.lens(_.date);
      override def resCount(self: Self) = self.lens(_.resCount);
      override def ageUpdate(self: Self) = self.lens(_.ageUpdate);
      override def active(self: Self) = self.lens(_.active);
    }

  implicit val implEq: Eq[TopicFork] = {
    import auto.eq._
    semi.eq
  }

  def create[F[_]: Monad: ObjectIdGeneratorAlg: ClockAlg: ConfigContainerAlg](
      title: String,
      parent: TopicNormal,
      user: User,
      authToken: AuthToken
  ): EitherT[
    F,
    AtError,
    (TopicFork, ResTopic[TopicForkId], ResFork, User, TopicNormal)
  ] = {
    for {
      title <- EitherT
        .fromEither[F](TopicTitle.fromString(title))
        .leftWiden[AtError]

      id <- EitherT.right(
        ObjectIdGeneratorAlg[F].generateObjectId().map(TopicForkId(_))
      )

      requestDate <- EitherT.right(ClockAlg[F].getRequestDate())

      val topic = TopicFork(
        id = id,
        title = title,
        update = requestDate,
        date = requestDate,
        resCount = 1,
        ageUpdate = requestDate,
        active = true,
        parent = parent.id
      )

      (res, topic) <- ResTopic
        .create[F, TopicFork](
          topic = topic,
          user = user,
          authToken = authToken
        )

      (resParent, parent) <- ResFork.create[F](
        topic = parent,
        user = user,
        authToken = authToken,
        fork = topic
      )

      user <- user.changeLastOneTopic[F]()
    } yield (topic, res, resParent, user, parent)
  }
}
