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
import TopicSearch.TopicSearchService
import cats.data.EitherT
import com.anontown.services.ClockAlg
import com.anontown.services.ObjectIdGeneratorAlg
import com.anontown.services.ConfigContainerAlg
import com.anontown.entities.user.User
import com.anontown.entities.res.ResTopic
import com.anontown.AtError

final case class TopicOneAPI(
    id: String,
    title: String,
    update: String,
    date: String,
    resCount: Int,
    active: Boolean,
    tags: List[String],
    text: String
) extends TopicSearchAPI
    with TopicTemporaryAPI;

object TopicOneAPI {
  implicit val implEq: Eq[TopicOneAPI] = {
    import auto.eq._
    semi.eq
  }
}
final case class TopicOne(
    id: TopicOneId,
    title: TopicTitle,
    update: OffsetDateTime,
    date: OffsetDateTime,
    resCount: Int,
    ageUpdate: OffsetDateTime,
    active: Boolean,
    tags: TopicTags,
    text: TopicText
);

object TopicOne {
  implicit val implEq: Eq[TopicOne] = {
    import auto.eq._
    semi.eq
  }

  implicit val implTopic
      : (TopicSearch[TopicOne] with TopicTemporary[TopicOne]) {
        type IdType = TopicOneId;
        type API = TopicOneAPI;
      } =
    new TopicSearch[TopicOne] with TopicTemporary[TopicOne] {
      type IdType = TopicOneId;

      val implTopicIdForIdType =
        implicitly[TopicSearchId[IdType] with TopicTemporaryId[IdType]]

      type API = TopicOneAPI;

      def toAPI(self: Self)(authToken: Option[AuthToken]): API = {
        LabelledGeneric[TopicOneAPI].from(
          self
            .topicAPIIntrinsicProperty(authToken)
            .merge(
              self
                .topicSearchAPIIntrinsicProperty(authToken)
            )
            .merge(
              self
                .topicTemporaryAPIIntrinsicProperty(authToken)
            )
        )
      }

      override def id(self: Self) = self.lens(_.id);
      override def title(self: Self) = self.lens(_.title);
      override def update(self: Self) = self.lens(_.update);
      override def date(self: Self) = self.lens(_.date);
      override def resCount(self: Self) = self.lens(_.resCount);
      override def ageUpdate(self: Self) = self.lens(_.ageUpdate);
      override def active(self: Self) = self.lens(_.active);
      override def tags(self: Self) = self.lens(_.tags);
      override def text(self: Self) = self.lens(_.text);
    }

  def create[F[_]: Monad: ObjectIdGeneratorAlg: ClockAlg: ConfigContainerAlg](
      title: String,
      tags: List[String],
      text: String,
      user: User,
      authToken: AuthToken
  ): EitherT[F, AtError, (TopicOne, ResTopic[TopicOneId], User)] = {
    for {
      (title, tags, text) <- EitherT
        .fromEither[F](
          (
            TopicTitle.fromString(title).toValidated,
            TopicTags.fromStringList(tags).toValidated,
            TopicText.fromString(text).toValidated
          ).mapN((_, _, _)).toEither
        )
        .leftWiden[AtError]

      id <- EitherT.right(ObjectIdGeneratorAlg[F].generateObjectId())
      requestDate <- EitherT.right(ClockAlg[F].getRequestDate())

      val topic = TopicOne(
        id = TopicOneId(id),
        title = title,
        tags = tags,
        text = text,
        date = requestDate,
        update = requestDate,
        resCount = 1,
        ageUpdate = requestDate,
        active = true
      )

      (res, newTopic) <- ResTopic.create[F, TopicOne](topic, user, authToken)

      newUser <- user.changeLastOneTopic[F]()
    } yield (newTopic, res, newUser)
  }
}
