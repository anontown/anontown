package com.anontown.entities

import java.time.OffsetDateTime
import cats._, cats.implicits._, cats.derived._
import com.anontown.utils.Impl._;
import zio.ZIO
import com.anontown.AtError
import com.anontown.ports.ObjectIdGeneratorComponent
import com.anontown.ports.ClockComponent
import com.anontown.Constant
import com.anontown.AtParamsError
import com.anontown.AtRightError
import com.anontown.AuthToken
import com.anontown.AtPrerequisiteError
import com.anontown.entities.VoteType.Uv
import com.anontown.entities.VoteType.Dv
import simulacrum._
import monocle.Lens
import monocle.syntax.apply._
import monocle.macros.GenLens
import monocle.syntax.ApplyLens
import Res.ops._;
import shapeless._
import record._
import com.anontown.utils.Record._

final case class Vote(user: UserId, value: Int);

object Vote {
  implicit val eqImpl: Eq[Vote] = {
    import auto.eq._
    semi.eq
  }
}

sealed trait VoteType;

object VoteType {
  implicit val eqImpl: Eq[VoteType] = {
    import auto.eq._
    semi.eq
  }

  final case class Uv() extends VoteType;
  final case class Dv() extends VoteType;
}

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

sealed trait ResNormalOrDeleteAPI extends ResAPI;

sealed trait VoteFlag;
object VoteFlag {
  final case class Uv() extends VoteFlag;
  final case class Dv() extends VoteFlag;
  final case class Not() extends VoteFlag;

  implicit val eqImpl: Eq[VoteFlag] = {
    import auto.eq._
    semi.eq
  }
}

sealed trait ResDeleteReason;
object ResDeleteReason {
  implicit val eqImpl: Eq[ResDeleteReason] = {
    import auto.eq._
    semi.eq
  }

  final case class Self() extends ResDeleteReason;
  final case class Freeze() extends ResDeleteReason;
}

final case class ResNormalAPI(
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
) extends ResAPI
    with ResNormalOrDeleteAPI;

object ResNormalAPI {
  implicit val eqImpl: Eq[ResNormalAPI] = {
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
  implicit val eqImpl: Eq[ResHistoryAPI] = {
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
  implicit val eqImpl: Eq[ResTopicAPI] = {
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
  implicit val eqImpl: Eq[ResForkAPI] = {
    import auto.eq._
    semi.eq
  }
}

final case class ResDeleteAPI(
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
) extends ResAPI
    with ResNormalOrDeleteAPI;

object ResDeleteAPI {
  implicit val eqImpl: Eq[ResDeleteAPI] = {
    import auto.eq._
    semi.eq
  }
}

final case class Reply(
    res: ResId,
    user: UserId
);

object Reply {
  implicit val eqImpl: Eq[Reply] = {
    import auto.eq._
    semi.eq
  }
}

final case class ResName(value: String) extends AnyVal;
object ResName {
  implicit val eqImpl: Eq[ResName] = {
    import auto.eq._
    semi.eq
  }

  def fromString(
      value: String
  ): Either[AtParamsError, ResName] = {
    Constant.Res.nameRegex.apValidate("name", value).map(ResName(_))
  }
}

final case class ResText(value: String) extends AnyVal;
object ResText {
  implicit val eqImpl: Eq[ResText] = {
    import auto.eq._
    semi.eq
  }

  def fromString(
      value: String
  ): Either[AtParamsError, ResText] = {
    Constant.Res.textRegex.apValidate("text", value).map(ResText(_))
  }
}

sealed trait ResId extends Any {
  def value: String;
}

object ResId {
  implicit val eqImpl: Eq[ResId] = {
    import auto.eq._
    semi.eq
  }
}

final case class ResNormalId(value: String) extends AnyVal with ResId;

object ResNormalId {
  implicit val eqImpl: Eq[ResNormalId] = {
    import auto.eq._
    semi.eq
  }
}

final case class ResHistoryId(value: String) extends AnyVal with ResId;

object ResHistoryId {
  implicit val eqImpl: Eq[ResHistoryId] = {
    import auto.eq._
    semi.eq
  }
}

final case class ResTopicId(value: String) extends AnyVal with ResId;

object ResTopicId {
  implicit val eqImpl: Eq[ResTopicId] = {
    import auto.eq._
    semi.eq
  }
}

final case class ResForkId(value: String) extends AnyVal with ResId;

object ResForkId {
  implicit val eqImpl: Eq[ResForkId] = {
    import auto.eq._
    semi.eq
  }
}
@typeclass
trait Res[A] {
  private implicit def resImpl = this;

  type Self = A;
  type Id <: ResId;
  type TId <: TopicId;
  type API <: ResAPI;

  type SelfLens[T] = Lens[A, T]
  type SelfApplyLens[T] = ApplyLens[A, A, T, T]
  type ResBaseRecord =
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

  def fromBaseAPI(self: A)(
      authToken: Option[AuthToken],
      api: ResBaseRecord
  ): API;
  def toAPI(self: A)(authToken: Option[AuthToken]): API = {
    this.fromBaseAPI(self)(
      authToken,
      Record(
        id = self.id.get.value,
        topicID = self.topic.get.value,
        date = self.date.get.toString,
        self = authToken.map(_.user === self.user.get),
        uv = self.votes.get.filter(x => x.value > 0).size,
        dv = self.votes.get.filter(x => x.value < 0).size,
        hash = self.hash.get,
        replyCount = self.replyCount.get,
        voteFlag = authToken.map(
          authToken =>
            self.votes.get
              .find(authToken.user === _.user)
              .map(vote => if (vote.value > 0) VoteFlag.Uv() else VoteFlag.Dv())
              .getOrElse(VoteFlag.Not())
        )
      )
    )
  }

  def idLens: SelfLens[Id];
  def topicLens: SelfLens[TId];
  def dateLens: SelfLens[OffsetDateTime];
  def userLens: SelfLens[UserId];
  def votesLens: SelfLens[List[Vote]];
  def lvLens: SelfLens[Int];
  def hashLens: SelfLens[String];
  def replyCountLens: SelfLens[Int];

  def id(self: A): SelfApplyLens[Id] = self.applyLens(this.idLens);
  def topic(self: A): SelfApplyLens[TId] = self.applyLens(this.topicLens);
  def date(self: A): SelfApplyLens[OffsetDateTime] =
    self.applyLens(this.dateLens);
  def user(self: A): SelfApplyLens[UserId] = self.applyLens(this.userLens);
  def votes(self: A): SelfApplyLens[List[Vote]] =
    self.applyLens(this.votesLens);
  def lv(self: A): SelfApplyLens[Int] = self.applyLens(this.lvLens);
  def hash(self: A): SelfApplyLens[String] = self.applyLens(this.hashLens);
  def replyCount(self: A): SelfApplyLens[Int] =
    self.applyLens(this.replyCountLens);

  def v(self: A)(
      resUser: User,
      user: User,
      vtype: VoteType,
      authToken: AuthToken
  ): Either[AtError, (A, User)] = {
    assert(resUser.id === self.user.get);
    assert(user.id === authToken.user);

    val voted = self.votes.get.find(_.user === user.id);
    for {
      data <- voted match {
        case Some(voted)
            if ((voted.value > 0 && vtype === VoteType
              .Uv()) || (voted.value < 0 && vtype === VoteType
              .Dv())) =>
          self.cv(resUser, user, authToken)
        case _ => Right((self, resUser))
      }

      result <- data._1._v(data._2, user, vtype, authToken)
    } yield result
  }

  // 既に投票していたらエラー
  def _v(self: A)(
      resUser: User,
      user: User,
      vtype: VoteType,
      authToken: AuthToken
  ): Either[AtError, (A, User)] = {
    assert(resUser.id === self.user.get);
    assert(user.id === authToken.user);

    if (user.id === self.user.get) {
      Left(new AtRightError("自分に投票は出来ません"));
    } else if (self.votes.get.find(_.user === user.id).isDefined) {
      Left(new AtPrerequisiteError("既に投票しています"))
    } else {
      val valueAbs = (user.lv.toDouble / 100.0).floor.toInt + 1;
      val value = vtype match {
        case Uv() => valueAbs;
        case Dv() => -valueAbs;
      }
      val newResUser = resUser.changeLv(resUser.lv + value);
      Right(
        (
          self.votes.modify(
            _.appended(Vote(user = user.id, value = value))
          ),
          newResUser
        )
      )
    }
  }

  def cv(self: A)(
      resUser: User,
      user: User,
      authToken: AuthToken
  ): Either[AtError, (A, User)] = {
    assert(resUser.id === self.user.get);
    assert(user.id === authToken.user);

    val vote = self.votes.get.find(_.user === user.id);
    vote match {
      case Some(vote) => {
        val newResUser = resUser.changeLv(resUser.lv - vote.value);
        Right(
          (
            self.votes.modify(_.filter(_.user =!= user.id)),
            newResUser
          )
        )
      }
      case None => Left(new AtPrerequisiteError("投票していません"))
    }
  }
}

final case class ResNormal(
    id: ResNormalId,
    topic: TopicId,
    date: OffsetDateTime,
    user: UserId,
    votes: List[Vote],
    lv: Int,
    hash: String,
    replyCount: Int,
    name: Option[ResName],
    text: ResText,
    reply: Option[Reply],
    deleteFlag: Option[ResDeleteReason],
    profile: Option[ProfileId],
    age: Boolean
) {
  def del(
      resUser: User,
      authToken: AuthToken
  ): Either[AtError, (ResNormal, User)] = {
    assert(resUser.id === authToken.user);
    for {
      _ <- Either.cond(
        authToken.user === this.user,
        (),
        new AtRightError("人の書き込み削除は出来ません")
      )

      _ <- Either.cond(
        this.deleteFlag.isEmpty,
        (),
        new AtPrerequisiteError("既に削除済みです")
      )

      val newResUser = resUser.changeLv(resUser.lv - 1)
    } yield (
      (
        this.copy(
          deleteFlag = Some(ResDeleteReason.Self())
        ),
        newResUser
      )
    )
  }
}

object ResNormal {
  implicit val eqImpl: Eq[ResNormal] = {
    import auto.eq._
    semi.eq
  }

  implicit val resImpl = new Res[ResNormal] {
    type Id = ResNormalId;
    type TId = TopicId;
    type API = ResNormalOrDeleteAPI;

    override def idLens = GenLens[Self](_.id)
    override def topicLens = GenLens[Self](_.topic)
    override def dateLens = GenLens[Self](_.date)
    override def userLens = GenLens[Self](_.user)
    override def votesLens = GenLens[Self](_.votes)
    override def lvLens = GenLens[Self](_.lv)
    override def hashLens = GenLens[Self](_.hash)
    override def replyCountLens =
      GenLens[Self](_.replyCount)

    override def fromBaseAPI(
        self: Self
    )(authToken: Option[AuthToken], base: ResBaseRecord): API = {
      self.deleteFlag match {
        case None =>
          LabelledGeneric[ResNormalAPI].from(
            base.merge(
              Record(
                name = self.name.map(_.value),
                text = self.text.value,
                replyID = self.reply.map(_.res.value),
                profileID = self.profile.map(_.value),
                isReply = authToken.flatMap(
                  authToken => self.reply.map(authToken.user === _.user)
                )
              )
            )
          )
        case Some(deleteFlag) =>
          LabelledGeneric[ResDeleteAPI].from(
            base.merge(
              Record(
                flag = deleteFlag
              )
            )
          )
      }
    }
  }

  def create[R: Res](
      topic: Topic,
      user: User,
      authUser: AuthToken,
      name: Option[String],
      text: String,
      reply: Option[R],
      profile: Option[Profile],
      age: Boolean
  ): ZIO[
    ObjectIdGeneratorComponent with ClockComponent,
    AtError,
    (ResNormal, User, Topic)
  ] = {
    assert(user.id === authUser.user);
    for {
      (name, text) <- ZIO.fromEither(
        (
          name
            .map(ResName.fromString(_).map(Some(_)))
            .getOrElse(Right(None))
            .toValidated,
          ResText.fromString(text).toValidated
        ).mapN((_, _)).toEither
      )

      _ <- ZIO.fromEither(
        Either.cond(
          profile.map(_.user === user.id).getOrElse(true),
          (),
          new AtRightError("自分のプロフィールを指定して下さい。")
        )
      )

      // もしリプ先があるかつ、トピックがリプ先と違えばエラー
      _ <- ZIO.fromEither(
        Either.cond(
          // TODO: id.valueしなくても比較できるようにする
          reply
            .map(reply => (reply.topic.get: TopicId) === (topic.id: TopicId))
            .getOrElse(true),
          (),
          new AtPrerequisiteError("他のトピックのレスへのリプは出来ません")
        )
      )

      requestDate <- ZIO.access[ClockComponent](_.clock.requestDate)

      newUser <- ZIO.fromEither(user.changeLastRes(requestDate))

      id <- ZIO.accessM[ObjectIdGeneratorComponent](
        _.objectIdGenerator.generateObjectId()
      )

      hash <- ZIO.access[ClockComponent](topic.hash(newUser)(_))

      val result = ResNormal(
        name = name,
        text = text,
        reply =
          reply.map(reply => Reply(res = reply.id.get, user = reply.user.get)),
        deleteFlag = None,
        profile = profile.map(_.id),
        age = age,
        id = ResNormalId(id),
        topic = topic.id,
        date = requestDate,
        user = newUser.id,
        votes = List(),
        lv = newUser.lv * 5,
        hash = hash,
        replyCount = 0
      )
      newTopic <- ZIO.fromEither(topic.resUpdate(result))
    } yield (result, newUser, newTopic)
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
  implicit val eqImpl: Eq[ResHistory] = {
    import auto.eq._
    semi.eq
  }

  implicit val resImpl = new Res[ResHistory] {
    type Id = ResHistoryId;
    type TId = TopicNormalId;
    type API = ResHistoryAPI

    override def idLens = GenLens[Self](_.id)
    override def topicLens = GenLens[Self](_.topic)
    override def dateLens = GenLens[Self](_.date)
    override def userLens = GenLens[Self](_.user)
    override def votesLens = GenLens[Self](_.votes)
    override def lvLens = GenLens[Self](_.lv)
    override def hashLens = GenLens[Self](_.hash)
    override def replyCountLens =
      GenLens[Self](_.replyCount)

    override def fromBaseAPI(
        self: Self
    )(authToken: Option[AuthToken], base: ResBaseRecord): API = {
      LabelledGeneric[ResHistoryAPI].from(
        base.merge(
          Record(
            historyID = self.history.value
          )
        )
      )
    }
  }

  def create(
      topic: TopicNormal,
      user: User,
      authUser: AuthToken,
      history: History
  ): ZIO[
    ObjectIdGeneratorComponent with ClockComponent,
    AtError,
    (ResHistory, Topic)
  ] = {
    assert(user.id === authUser.user);
    for {
      requestDate <- ZIO.access[ClockComponent](_.clock.requestDate)
      id <- ZIO.accessM[ObjectIdGeneratorComponent](
        _.objectIdGenerator.generateObjectId()
      )

      hash <- ZIO.access[ClockComponent](topic.hash(user)(_))

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
      newTopic <- ZIO.fromEither(topic.resUpdate(result))
    } yield (result, newTopic)
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
  type Id = ResTopicId;
  type TId = TopicTemporaryId;
}

object ResTopic {
  implicit val eqImpl: Eq[ResTopic] = {
    import auto.eq._
    semi.eq
  }

  implicit val resImpl = new Res[ResTopic] {
    type Id = ResTopicId;
    type TId = TopicTemporaryId;
    type API = ResTopicAPI

    override def idLens = GenLens[Self](_.id)
    override def topicLens = GenLens[Self](_.topic)
    override def dateLens = GenLens[Self](_.date)
    override def userLens = GenLens[Self](_.user)
    override def votesLens = GenLens[Self](_.votes)
    override def lvLens = GenLens[Self](_.lv)
    override def hashLens = GenLens[Self](_.hash)
    override def replyCountLens =
      GenLens[Self](_.replyCount)

    override def fromBaseAPI(
        self: Self
    )(authToken: Option[AuthToken], base: ResBaseRecord): API = {
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
  implicit val eqImpl: Eq[ResFork] = {
    import auto.eq._
    semi.eq
  }

  implicit val resImpl = new Res[ResFork] {
    type Id = ResForkId;
    type TId = TopicNormalId;
    type API = ResForkAPI

    override def idLens = GenLens[Self](_.id)
    override def topicLens = GenLens[Self](_.topic)
    override def dateLens = GenLens[Self](_.date)
    override def userLens = GenLens[Self](_.user)
    override def votesLens = GenLens[Self](_.votes)
    override def lvLens = GenLens[Self](_.lv)
    override def hashLens = GenLens[Self](_.hash)
    override def replyCountLens =
      GenLens[Self](_.replyCount)

    override def fromBaseAPI(
        self: Self
    )(authToken: Option[AuthToken], base: ResBaseRecord): API = {
      LabelledGeneric[ResForkAPI].from(
        base.merge(Record(forkID = self.fork.value))
      )
    }
  }

  // TODO: TopicNormalを返す
  def create(
      topic: TopicNormal,
      user: User,
      authUser: AuthToken,
      fork: TopicFork
  ): ZIO[
    ObjectIdGeneratorComponent with ClockComponent,
    AtError,
    (ResFork, Topic)
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
