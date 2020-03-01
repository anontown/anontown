package com.anontown.entities.res

import java.time.OffsetDateTime
import cats.implicits._
import com.anontown.AtError
import com.anontown.AtRightError
import com.anontown.AuthToken
import com.anontown.AtPrerequisiteError
import monocle.syntax.ApplyLens
import shapeless._
import record._
import com.anontown.utils.Record._
import com.anontown.entities.user.{UserId, User}
import com.anontown.entities.topic.TopicId
import cats.Applicative
import cats._, cats.implicits._, cats.derived._
import monocle.macros.syntax.lens._
import com.anontown.entities.topic.{
  TopicNormalId,
  TopicNormal,
  TopicForkId,
  TopicFork,
  Topic
}
import cats.data.EitherT
import com.anontown.entities.topic.Topic.TopicService
import com.anontown.services.ConfigContainerAlg
import com.anontown.services.ObjectIdGeneratorAlg
import com.anontown.services.ClockAlg
import com.anontown.entities.history.{HistoryId, History}
import com.anontown.entities.topic.{TopicTemporary, UntaggedTopicId}
import com.anontown.entities.profile.{ProfileId, Profile}

sealed trait ResAPI {
  val id: String;
  val topicID: String;
  val date: String;
  val self: Option[Boolean];
  val uv: Int;
  val dv: Int;
  val hash: String;
  val replyCount: Int;
  val voteFlag: Option[VoteFlag];
}

object ResAPI {
  implicit val implEq: Eq[ResAPI] = {
    import auto.eq._
    semi.eq
  }
}

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

sealed trait ResNormalAPI extends ResAPI;

object ResNormalAPI {
  implicit val implEq: Eq[ResNormalAPI] = {
    import auto.eq._
    semi.eq
  }
}

final case class ResNormalActiveAPI(
    id: String,
    topicID: String,
    date: String,
    self: Option[Boolean],
    uv: Int,
    dv: Int,
    hash: String,
    replyCount: Int,
    voteFlag: Option[VoteFlag],
    name: Option[String],
    text: String,
    replyID: Option[String],
    profileID: Option[String],
    isReply: Option[Boolean]
) extends ResNormalAPI;

object ResNormalActiveAPI {
  implicit val implEq: Eq[ResNormalActiveAPI] = {
    import auto.eq._
    semi.eq
  }
}

final case class ResNormalDeleteAPI(
    id: String,
    topicID: String,
    date: String,
    self: Option[Boolean],
    uv: Int,
    dv: Int,
    hash: String,
    replyCount: Int,
    voteFlag: Option[VoteFlag],
    flag: ResDeleteReason
) extends ResNormalAPI;

object ResNormalDeleteAPI {
  implicit val implEq: Eq[ResNormalDeleteAPI] = {
    import auto.eq._
    semi.eq
  }
}

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

sealed trait Res {
  type Self <: Res;
  type IdType <: TaggedResId;

  type TopicIdType <: TopicId;

  type API <: ResAPI;

  type SelfApplyLens[T] = ApplyLens[Self, Self, T, T]

  def toAPI(
      authToken: Option[AuthToken]
  ): API;

  def idLens: SelfApplyLens[IdType];
  def topicLens: SelfApplyLens[TopicIdType];
  def dateLens: SelfApplyLens[OffsetDateTime];
  def userLens: SelfApplyLens[UserId];
  def votesLens: SelfApplyLens[List[Vote]];
  def lvLens: SelfApplyLens[Int];
  def hashLens: SelfApplyLens[String];
  def replyCountLens: SelfApplyLens[Int];
}

object Res {
  implicit class ResService[A <: Res { type Self = A }](val self: A) {
    type ResAPIIntrinsicProperty =
      ("id" ->> String) ::
        ("topicID" ->> String) ::
        ("date" ->> String) ::
        ("self" ->> Option[Boolean]) ::
        ("uv" ->> Int) ::
        ("dv" ->> Int) ::
        ("hash" ->> String) ::
        ("replyCount" ->> Int) ::
        ("voteFlag" ->> Option[VoteFlag]) ::
        HNil

    def resAPIIntrinsicProperty(
        authToken: Option[AuthToken]
    ): ResAPIIntrinsicProperty = {
      Record(
        id = self.idLens.get.value,
        topicID = self.topicLens.get.value,
        date = self.dateLens.get.toString,
        self = authToken.map(_.user === self.userLens.get),
        uv = self.votesLens.get.filter(x => x.value > 0).size,
        dv = self.votesLens.get.filter(x => x.value < 0).size,
        hash = self.hashLens.get,
        replyCount = self.replyCountLens.get,
        voteFlag = authToken.map(
          authToken =>
            self.votesLens.get
              .find(authToken.user === _.user)
              .map(
                vote =>
                  if (vote.value > 0) VoteFlag.Uv()
                  else VoteFlag.Dv()
              )
              .getOrElse(VoteFlag.Not())
        )
      )
    }

    // 既に投票していたらエラー
    def vote(
        resUser: User,
        user: User,
        vtype: VoteType,
        authToken: AuthToken
    ): Either[AtError, (A, User)] = {
      type Result[A] = Either[AtError, A];

      assert(resUser.id === self.userLens.get);
      assert(user.id === authToken.user);

      for {
        _ <- Applicative[Result].whenA(user.id === self.userLens.get)(
          Left(new AtRightError("自分に投票は出来ません"))
        )
        _ <- Applicative[Result].whenA(
          self.votesLens.get.exists(_.user === user.id)
        )(Left(new AtPrerequisiteError("既に投票しています")))

        val valueAbs = (user.lv.toDouble / 100.0).floor.toInt + 1
        val value = vtype match {
          case VoteType.Uv() => valueAbs;
          case VoteType.Dv() => -valueAbs;
        }
        resUser <- Applicative[Result].pure(
          resUser.changeLv(resUser.lv + value)
        )
      } yield (
        self.votesLens.modify(
          _.appended(Vote(user = user.id, value = value))
        ),
        resUser
      )
    }

    def resetAndVote(
        resUser: User,
        user: User,
        vtype: VoteType,
        authToken: AuthToken
    ): Either[AtError, (A, User)] = {
      assert(resUser.id === self.userLens.get);
      assert(user.id === authToken.user);

      for {
        (res, resUser) <- self.votesLens.get
          .find(_.user === user.id)
          .filter(
            voted =>
              (
                voted.value > 0 && vtype === VoteType
                  .Uv()
              ) || (voted.value < 0 && vtype === VoteType
                .Dv())
          )
          .as(self.cv(resUser, user, authToken))
          .getOrElse(Right((self, resUser)))

        result <- res.vote(resUser, user, vtype, authToken)
      } yield result
    }

    def cv(
        resUser: User,
        user: User,
        authToken: AuthToken
    ): Either[AtError, (A, User)] = {
      type Result[A] = Either[AtError, A];

      assert(resUser.id === self.userLens.get);
      assert(user.id === authToken.user);

      for {
        vote <- self.votesLens.get
          .find(_.user === user.id)
          .liftTo(new AtPrerequisiteError("投票していません"))
        resUser <- Applicative[Result].pure(
          resUser.changeLv(resUser.lv - vote.value)
        )
      } yield (
        self.votesLens.modify(_.filter(_.user =!= user.id)),
        resUser
      )
    }
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
) extends Res {
  type Self = ResFork;
  type IdType = ResForkId;
  type TopicIdType = TopicNormalId;

  type API = ResForkAPI

  override def idLens = this.lens(_.id)
  override def topicLens = this.lens(_.topic)
  override def dateLens = this.lens(_.date)
  override def userLens = this.lens(_.user)
  override def votesLens = this.lens(_.votes)
  override def lvLens = this.lens(_.lv)
  override def hashLens = this.lens(_.hash)
  override def replyCountLens =
    this.lens(_.replyCount)

  override def toAPI(authToken: Option[AuthToken]): API = {
    LabelledGeneric[ResForkAPI].from(
      this
        .resAPIIntrinsicProperty(authToken)
        .merge(Record(forkID = this.fork.value))
    )
  }
}

object ResFork {
  def create[F[_]: Monad: ObjectIdGeneratorAlg: ClockAlg: ConfigContainerAlg](
      topic: TopicNormal,
      user: User,
      authToken: AuthToken,
      fork: TopicFork
  ): EitherT[
    F,
    AtError,
    (ResFork, TopicNormal)
  ] = {
    assert(user.id === authToken.user);
    for {
      requestDate <- EitherT.right(ClockAlg[F].getRequestDate())
      id <- EitherT.right(ObjectIdGeneratorAlg[F].generateObjectId())

      hash <- EitherT.right(topic.hash[F](user))

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
      topic <- EitherT.fromEither[F](topic.resUpdate(result, false))
    } yield (result, topic)
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
) extends Res {
  type Self = ResHistory;
  type IdType = ResHistoryId;
  type TopicIdType = TopicNormalId;

  type API = ResHistoryAPI

  override def idLens = this.lens(_.id)
  override def topicLens = this.lens(_.topic)
  override def dateLens = this.lens(_.date)
  override def userLens = this.lens(_.user)
  override def votesLens = this.lens(_.votes)
  override def lvLens = this.lens(_.lv)
  override def hashLens = this.lens(_.hash)
  override def replyCountLens =
    this.lens(_.replyCount)

  override def toAPI(authToken: Option[AuthToken]): API = {
    LabelledGeneric[ResHistoryAPI].from(
      this
        .resAPIIntrinsicProperty(authToken)
        .merge(
          Record(
            historyID = this.history.value
          )
        )
    )
  }
}

object ResHistory {
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
      topic <- EitherT.fromEither[F](topic.resUpdate(result, false))
    } yield (result, topic)
  }
}

final case class ResNormal[+ReplyResId <: ResId, +TopicIdType <: TopicId](
    id: ResNormalId,
    topic: TopicIdType,
    date: OffsetDateTime,
    user: UserId,
    votes: List[Vote],
    lv: Int,
    hash: String,
    replyCount: Int,
    name: Option[ResName],
    text: ResText,
    reply: Option[Reply[ReplyResId]],
    deleteFlag: Option[ResDeleteReason],
    profile: Option[ProfileId],
    age: Boolean
) extends Res {
  type Self = ResNormal[ReplyResId, TopicIdType];
  type IdType = ResNormalId;

  type TopicIdType = TopicIdType;

  type API = ResNormalAPI;

  override def idLens = this.lens(_.id)
  override def topicLens = this.lens(_.topic)
  override def dateLens = this.lens(_.date)
  override def userLens = this.lens(_.user)
  override def votesLens = this.lens(_.votes)
  override def lvLens = this.lens(_.lv)
  override def hashLens = this.lens(_.hash)
  override def replyCountLens =
    this.lens(_.replyCount)

  override def toAPI(authToken: Option[AuthToken]): API = {
    this.deleteFlag match {
      case None =>
        LabelledGeneric[ResNormalActiveAPI].from(
          this
            .resAPIIntrinsicProperty(authToken)
            .merge(
              Record(
                name = this.name.map(_.value),
                text = this.text.value,
                replyID = this.reply.map(_.res.value),
                profileID = this.profile.map(_.value),
                isReply = authToken.flatMap(
                  authToken => this.reply.map(authToken.user === _.user)
                )
              )
            )
        )
      case Some(deleteFlag) =>
        LabelledGeneric[ResNormalDeleteAPI].from(
          this
            .resAPIIntrinsicProperty(authToken)
            .merge(
              Record(
                flag = deleteFlag
              )
            )
        )
    }
  }
}

object ResNormal {
  def create[F[_]: Monad: ObjectIdGeneratorAlg: ClockAlg: ConfigContainerAlg, ResIdType <: ResId, ResType <: Res { type Self = ResType; type IdType = ResIdType; }, TopicType <: Topic { type Self = TopicType; }](
      topic: TopicType,
      user: User,
      authUser: AuthToken,
      name: Option[String],
      text: String,
      reply: Option[ResType],
      profile: Option[Profile],
      age: Boolean
  ): EitherT[
    F,
    AtError,
    (ResNormal[ResIdType, topic.IdType], User, TopicType)
  ] = {
    assert(user.id === authUser.user);

    for {
      (name, text) <- EitherT
        .fromEither[F](
          (
            name
              .map(ResName.fromString(_).map(Some(_)))
              .getOrElse(Right(None))
              .toValidated,
            ResText.fromString(text).toValidated
          ).mapN((_, _)).toEither
        )
        .leftWiden[AtError]

      _ <- EitherT
        .fromEither[F](
          Either.cond(
            profile.map(_.user === user.id).getOrElse(true),
            (),
            new AtRightError("自分のプロフィールを指定して下さい。")
          )
        )
        .leftWiden[AtError]

      // もしリプ先があるかつ、トピックがリプ先と違えばエラー
      _ <- EitherT
        .fromEither[F](
          Either.cond(
            reply
              .map(
                reply =>
                  UntaggedTopicId
                    .fromTopicId(reply.topicLens.get) === UntaggedTopicId
                    .fromTopicId(topic.idLens.get)
              )
              .getOrElse(true),
            (),
            new AtPrerequisiteError("他のトピックのレスへのリプは出来ません")
          )
        )
        .leftWiden[AtError]

      requestDate <- EitherT.right(ClockAlg[F].getRequestDate())

      user <- user.changeLastRes[F]()

      id <- EitherT.right(
        ObjectIdGeneratorAlg[F].generateObjectId()
      )

      hash <- EitherT.right(topic.hash[F](user))

      val result = ResNormal(
        name = name,
        text = text,
        reply = reply.map(
          reply => Reply(res = reply.idLens.get, user = reply.userLens.get)
        ),
        deleteFlag = None,
        profile = profile.map(_.id),
        age = age,
        id = ResNormalId(id),
        topic = topic.idLens.get,
        date = requestDate,
        user = user.id,
        votes = List(),
        lv = user.lv * 5,
        hash = hash,
        replyCount = 0
      )
      topic <- EitherT.fromEither[F](topic.resUpdate(result, result.age))
    } yield (result, user, topic)
  }

  implicit class ResNormalService[ReplyResId <: ResId, TopicIdType <: TopicId](
      val self: ResNormal[ReplyResId, TopicIdType]
  ) {
    def del(
        resUser: User,
        authToken: AuthToken
    ): Either[AtError, (ResNormal[ReplyResId, TopicIdType], User)] = {
      type Result[A] = Either[AtError, A]

      assert(resUser.id === authToken.user);
      for {
        _ <- Either.cond(
          authToken.user === self.user,
          (),
          new AtRightError("人の書き込み削除は出来ません")
        )

        _ <- Either.cond(
          self.deleteFlag.isEmpty,
          (),
          new AtPrerequisiteError("既に削除済みです")
        )

        resUser <- Applicative[Result].pure(resUser.changeLv(resUser.lv - 1))
      } yield (
        (
          self.copy(
            deleteFlag = Some(ResDeleteReason.Self())
          ),
          resUser
        )
      )
    }
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
) extends Res {
  type Self = ResTopic[TopicArg]

  type IdType = ResTopicId;

  type TopicIdType = TopicArg

  type API = ResTopicAPI

  override def idLens = this.lens(_.id)
  override def topicLens = this.lens(_.topic)
  override def dateLens = this.lens(_.date)
  override def userLens = this.lens(_.user)
  override def votesLens = this.lens(_.votes)
  override def lvLens = this.lens(_.lv)
  override def hashLens = this.lens(_.hash)
  override def replyCountLens =
    this.lens(_.replyCount)

  override def toAPI(authToken: Option[AuthToken]): API = {
    LabelledGeneric[ResTopicAPI].from(
      this
        .resAPIIntrinsicProperty(authToken)
    )
  }
}

object ResTopic {
  def create[F[_]: Monad: ObjectIdGeneratorAlg: ClockAlg: ConfigContainerAlg, TopicTemporaryType <: TopicTemporary { type Self = TopicTemporaryType }](
      topic: TopicTemporaryType,
      user: User,
      authToken: AuthToken
  ): EitherT[
    F,
    AtError,
    (ResTopic[topic.IdType], TopicTemporaryType)
  ] = {
    assert(user.id === authToken.user);

    for {
      requestDate <- EitherT.right(ClockAlg[F].getRequestDate())
      id <- EitherT.right(
        ObjectIdGeneratorAlg[F].generateObjectId()
      )

      hash <- EitherT.right(topic.hash[F](user))

      val result = ResTopic(
        id = ResTopicId(id),
        topic = topic.idLens.get,
        date = requestDate,
        user = user.id,
        votes = List(),
        lv = user.lv * 5,
        hash = hash,
        replyCount = 0
      )
      topic <- EitherT.fromEither[F](topic.resUpdate(result, false))
    } yield (result, topic)
  }
}
