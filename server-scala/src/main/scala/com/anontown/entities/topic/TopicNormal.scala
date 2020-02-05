package com.anontown.entities.topic

import cats._, cats.implicits._, cats.derived._
import com.anontown.utils.Impl._;
import java.time.OffsetDateTime
import monocle.macros.syntax.lens._
import com.anontown.AuthToken
import shapeless._
import record._
import Topic.TopicService
import TopicSearch.TopicSearchService
import com.anontown.entities.history.History
import com.anontown.entities.res.ResHistory
import com.anontown.entities.user.User
import com.anontown.services.ClockAlg
import com.anontown.services.ObjectIdGeneratorAlg
import cats.data.EitherT
import com.anontown.AtError
import com.anontown.entities.user.User
import com.anontown.services.ConfigContainerAlg

final case class TopicNormalAPI(
    id: String,
    title: String,
    update: String,
    date: String,
    resCount: Int,
    active: Boolean,
    tags: List[String],
    text: String
) extends TopicSearchAPI;

object TopicNormalAPI {
  implicit val implEq: Eq[TopicNormalAPI] = {
    import auto.eq._
    semi.eq
  }
}
final case class TopicNormal(
    id: TopicNormalId,
    title: TopicTitle,
    update: OffsetDateTime,
    date: OffsetDateTime,
    resCount: Int,
    ageUpdate: OffsetDateTime,
    active: Boolean,
    tags: TopicTags,
    text: TopicText
);

object TopicNormal {
  implicit val implEq: Eq[TopicNormal] = {
    import auto.eq._
    semi.eq
  }

  def create[F[_]: Monad: ObjectIdGeneratorAlg: ClockAlg: ConfigContainerAlg](
      title: String,
      tags: List[String],
      text: String,
      user: User,
      authToken: AuthToken
  ): EitherT[F, AtError, (TopicNormal, History, ResHistory, User)] = {
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

      val topic = TopicNormal(
        id = TopicNormalId(id),
        title = title,
        update = requestDate,
        date = requestDate,
        resCount = 1,
        ageUpdate = requestDate,
        active = true,
        tags = tags,
        text = text
      )

      cd <- topic.changeData[F](
        user = user,
        authToken = authToken,
        title = Some(title.value),
        tags = Some(tags.value.map(_.value)),
        text = Some(text.value)
      )

      user <- cd._4.changeLastTopic[F]()
    } yield (cd._1, cd._3, cd._2, user)
  }

  implicit val implTopic: TopicSearch[TopicNormal] {
    type IdType = TopicNormalId;
    type API = TopicNormalAPI;
  } =
    new TopicSearch[TopicNormal] {
      type IdType = TopicNormalId;

      val implTopicIdForIdType = implicitly

      type API = TopicNormalAPI;

      def toAPI(self: Self)(authToken: Option[AuthToken]): API = {
        LabelledGeneric[TopicNormalAPI].from(
          self
            .topicAPIIntrinsicProperty(authToken)
            .merge(
              self
                .topicSearchAPIIntrinsicProperty(authToken)
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

  implicit class TopicNormalService(val self: TopicNormal) {
    def changeData[F[_]: Monad: ObjectIdGeneratorAlg: ClockAlg: ConfigContainerAlg](
        user: User,
        authToken: AuthToken,
        title: Option[String],
        tags: Option[List[String]],
        text: Option[String]
    ): EitherT[F, AtError, (TopicNormal, ResHistory, History, User)] = {
      type Result[A] = EitherT[F, AtError, A]
      for {
        user <- EitherT.fromEither[F](user.usePoint(10))
        (title, tags, text) <- EitherT
          .fromEither[F](
            (
              title
                .map(TopicTitle.fromString(_))
                .getOrElse(Right(self.title))
                .toValidated,
              tags
                .map(TopicTags.fromStringList(_))
                .getOrElse(Right(self.tags))
                .toValidated,
              text
                .map(TopicText.fromString(_))
                .getOrElse(Right(self.text))
                .toValidated
            ).mapN((_, _, _)).toEither
          )
          .leftWiden[AtError]

        topic <- Applicative[Result].pure(
          self.copy(title = title, tags = tags, text = text)
        )

        hash <- EitherT.right(topic.hash[F](user))

        history <- EitherT.right(
          History
            .create[F](
              topicId = topic.id,
              title = topic.title,
              tags = topic.tags,
              text = topic.text,
              hash = hash,
              user = user
            )
        )

        (res, topic) <- ResHistory
          .create[F](
            topic = topic,
            user = user,
            authToken = authToken,
            history = history
          )
      } yield (topic, res, history, user)
    }
  }
}
