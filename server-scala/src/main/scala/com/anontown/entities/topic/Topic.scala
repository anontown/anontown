package com.anontown.entities.topic

import cats._, cats.implicits._, cats.derived._
import com.anontown.AtError
import com.anontown.ports.ClockAlg
import com.anontown.entities.res.{Res, ResFork, ResTopic, ResHistory}
import com.anontown.entities.history.History
import com.anontown.entities.user.User
import monocle.syntax.ApplyLens
import shapeless._
import record._
import com.anontown.extra.RecordExtra._
import com.anontown.AuthToken
import com.anontown.AtPrerequisiteError
import com.anontown.ports.ConfigContainerAlg
import cats.data.EitherT
import com.anontown.ports.ObjectIdGeneratorAlg
import monocle.macros.syntax.lens.toGenApplyLensOps
import com.anontown.entities.DateTime
import com.anontown.services.HashAlg

sealed trait TopicAPI {
  val id: String;
  val title: String;
  val update: String;
  val date: String;
  val resCount: Int;
  val active: Boolean;
}

object TopicAPI {
  implicit val implEq: Eq[TopicAPI] = {
    import auto.eq._
    semi.eq
  }
}

sealed trait TopicTemporaryAPI extends TopicAPI {}

object TopicTemporaryAPI {
  implicit val implEq: Eq[TopicTemporaryAPI] = {
    import auto.eq._
    semi.eq
  }
}

sealed trait TopicSearchAPI extends TopicAPI {
  val tags: List[String];
  val text: String;
}

object TopicSearchAPI {
  implicit val implEq: Eq[TopicSearchAPI] = {
    import auto.eq._
    semi.eq
  }
}

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

sealed trait Topic {
  type Self <: Topic;
  type IdType <: TaggedTopicId;
  type API <: TopicAPI;

  type SelfApplyLens[T] = ApplyLens[Self, Self, T, T];

  def toAPI(
      authToken: Option[AuthToken]
  ): API;

  def id: IdType;
  def titleLens: SelfApplyLens[TopicTitle];
  def updateLens: SelfApplyLens[DateTime];
  def date: DateTime;
  def resCountLens: SelfApplyLens[Int];
  def ageUpdateLens: SelfApplyLens[DateTime];
  def activeLens: SelfApplyLens[Boolean];

  def asTopicSearch: Option[TopicSearch] = None;
  def asTopicTemporary: Option[TopicTemporary] = None;
  def asTopicNormal: Option[TopicNormal] = None;
  def asTopicOne: Option[TopicOne] = None;
  def asTopicFork: Option[TopicFork] = None;
}

object Topic {
  implicit class TopicService[A <: Topic { type Self <: A }](val self: A) {
    val hashLen: Int = 6;

    type TopicAPIIntrinsicProperty =
      ("id" ->> String) ::
        ("title" ->> String) ::
        ("update" ->> String) ::
        ("date" ->> String) ::
        ("resCount" ->> Int) ::
        ("active" ->> Boolean) ::
        HNil

    def topicAPIIntrinsicProperty(
        authToken: Option[AuthToken]
    ): TopicAPIIntrinsicProperty = {
      Record(
        id = self.id.value,
        title = self.titleLens.get.value,
        update = self.updateLens.get.toString,
        date = self.date.toString,
        resCount = self.resCountLens.get,
        active = self.activeLens.get
      )
    }

    def hash[F[_]: Monad: ConfigContainerAlg: ClockAlg: HashAlg](
        user: User
    ): F[String] = {
      for {
        config <- ConfigContainerAlg[F].getConfig()
        requestDate <- ClockAlg[F].getRequestDate()
        val zonedDate = requestDate
          .toOffsetDateTime()
          .atZoneSameInstant(config.timezone)
        hash <- HashAlg[F].sha256(
          f"${user.id.value} ${zonedDate.getYear().toString()} ${zonedDate
            .getMonth()
            .toString()} ${zonedDate.getDayOfMonth().toString()} ${self.id.value} ${config.salt.hash}"
        )
      } yield hash.substring(0, hashLen)
    }

    def resUpdate[R <: Res](res: R, isAge: Boolean): Either[AtError, A] = {
      if (!self.activeLens.get) {
        Left(new AtPrerequisiteError("トピックが落ちているので書き込めません"))
      } else {
        Right(
          self.updateLens
            .set(res.date)
            .ageUpdateLens
            .modify(
              prevAgeUpdate =>
                if (isAge) {
                  res.date
                } else {
                  prevAgeUpdate
                }
            )
        )
      }
    }
  }
}

sealed trait TopicSearch extends Topic {
  override type Self <: TopicSearch;
  override type IdType <: TaggedTopicSearchId;

  override type API <: TopicSearchAPI;

  def tagsLens: SelfApplyLens[TopicTags];
  def textLens: SelfApplyLens[TopicText];

  override def asTopicSearch: Option[TopicSearch] = Some(this);
}

object TopicSearch {
  implicit class TopicSearchService[A <: TopicSearch { type Self = A }](
      val self: A
  ) {
    type TopicSearchAPIIntrinsicProperty =
      ("tags" ->> List[String]) ::
        ("text" ->> String) ::
        HNil

    def topicSearchAPIIntrinsicProperty(
        authToken: Option[AuthToken]
    ): TopicSearchAPIIntrinsicProperty = {
      Record(
        tags = self.tagsLens.get.value.map(_.value),
        text = self.textLens.get.value
      )
    }
  }
}

sealed trait TopicTemporary extends Topic {
  override type Self <: TopicTemporary;
  override type IdType <: TaggedTopicTemporaryId;

  override type API <: TopicTemporaryAPI;

  override def asTopicTemporary: Option[TopicTemporary] = Some(this);
}

object TopicTemporary {
  implicit class TopicTemporaryService[A <: TopicTemporary](val self: A) {
    type TopicTemporaryAPIIntrinsicProperty = HNil

    def topicTemporaryAPIIntrinsicProperty(
        authToken: Option[AuthToken]
    ): TopicTemporaryAPIIntrinsicProperty = {
      Record()
    }
  }
}

final case class TopicFork(
    id: TopicForkId,
    title: TopicTitle,
    update: DateTime,
    date: DateTime,
    resCount: Int,
    ageUpdate: DateTime,
    active: Boolean,
    parent: TopicNormalId
) extends TopicTemporary {
  override type Self = TopicFork;
  override type IdType = TopicForkId;

  override type API = TopicForkAPI;

  override def toAPI(authToken: Option[AuthToken]): API = {
    LabelledGeneric[TopicForkAPI].from(
      this
        .topicAPIIntrinsicProperty(authToken)
        .merge(
          this
            .topicTemporaryAPIIntrinsicProperty(authToken)
        )
        .merge(Record(parentID = this.parent.value))
    )
  }

  override def titleLens = this.lens(_.title);
  override def updateLens = this.lens(_.update);
  override def resCountLens = this.lens(_.resCount);
  override def ageUpdateLens = this.lens(_.ageUpdate);
  override def activeLens = this.lens(_.active);

  override def asTopicFork: Option[TopicFork] = Some(this);
}

object TopicFork {
  implicit val implEq: Eq[TopicFork] = {
    import auto.eq._
    semi.eq
  }

  def create[F[_]: Monad: ObjectIdGeneratorAlg: ClockAlg: ConfigContainerAlg: HashAlg](
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

final case class TopicOne(
    id: TopicOneId,
    title: TopicTitle,
    update: DateTime,
    date: DateTime,
    resCount: Int,
    ageUpdate: DateTime,
    active: Boolean,
    tags: TopicTags,
    text: TopicText
) extends TopicSearch
    with TopicTemporary {
  override type Self = TopicOne;
  override type IdType = TopicOneId;

  override type API = TopicOneAPI;

  override def toAPI(authToken: Option[AuthToken]): API = {
    LabelledGeneric[TopicOneAPI].from(
      this
        .topicAPIIntrinsicProperty(authToken)
        .merge(
          this
            .topicSearchAPIIntrinsicProperty(authToken)
        )
        .merge(
          this
            .topicTemporaryAPIIntrinsicProperty(authToken)
        )
    )
  }

  override def titleLens = this.lens(_.title);
  override def updateLens = this.lens(_.update);
  override def resCountLens = this.lens(_.resCount);
  override def ageUpdateLens = this.lens(_.ageUpdate);
  override def activeLens = this.lens(_.active);
  override def tagsLens = this.lens(_.tags);
  override def textLens = this.lens(_.text);

  override def asTopicOne: Option[TopicOne] = Some(this);
}

object TopicOne {
  implicit val implEq: Eq[TopicOne] = {
    import auto.eq._
    semi.eq
  }

  def create[F[_]: Monad: ObjectIdGeneratorAlg: ClockAlg: ConfigContainerAlg: HashAlg](
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

      (res, topic) <- ResTopic.create[F, TopicOne](topic, user, authToken)

      user <- user.changeLastOneTopic[F]()
    } yield (topic, res, user)
  }
}

final case class TopicNormal(
    id: TopicNormalId,
    title: TopicTitle,
    update: DateTime,
    date: DateTime,
    resCount: Int,
    ageUpdate: DateTime,
    active: Boolean,
    tags: TopicTags,
    text: TopicText
) extends TopicSearch {
  override type Self = TopicNormal;
  override type IdType = TopicNormalId;

  override type API = TopicNormalAPI;

  override def toAPI(authToken: Option[AuthToken]): API = {
    LabelledGeneric[TopicNormalAPI].from(
      this
        .topicAPIIntrinsicProperty(authToken)
        .merge(
          this
            .topicSearchAPIIntrinsicProperty(authToken)
        )
    )
  }

  override def titleLens = this.lens(_.title);
  override def updateLens = this.lens(_.update);
  override def resCountLens = this.lens(_.resCount);
  override def ageUpdateLens = this.lens(_.ageUpdate);
  override def activeLens = this.lens(_.active);
  override def tagsLens = this.lens(_.tags);
  override def textLens = this.lens(_.text);

  override def asTopicNormal: Option[TopicNormal] = Some(this);
}

object TopicNormal {
  implicit val implEq: Eq[TopicNormal] = {
    import auto.eq._
    semi.eq
  }

  def create[F[_]: Monad: ObjectIdGeneratorAlg: ClockAlg: ConfigContainerAlg: HashAlg](
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

  implicit class TopicNormalService(val self: TopicNormal) {
    def changeData[F[_]: Monad: ObjectIdGeneratorAlg: ClockAlg: ConfigContainerAlg: HashAlg](
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
