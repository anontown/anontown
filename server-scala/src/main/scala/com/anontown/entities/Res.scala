package com.anontown.entities

import java.time.OffsetDateTime
import cats._, cats.implicits._, cats.derived._
import com.anontown.utils.Impl._;
import zio.ZIO
import com.anontown.AuthTokenMaster
import com.anontown.AtError
import com.anontown.ports.ObjectIdGeneratorComponent
import com.anontown.ports.ClockComponent
import com.anontown.Constant
import com.anontown.AtParamsError
import com.anontown.AtRightError
import com.anontown.AuthToken
import com.anontown.AtServerError
import com.anontown.AtPrerequisiteError
import com.anontown.entities.VoteType.Uv
import com.anontown.entities.VoteType.Dv
import simulacrum._
import scala.util.chaining._;
import monocle.Lens
import monocle.syntax.apply._
import monocle.macros.GenLens
import monocle.syntax.ApplyLens

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
  val voteFlag: VoteFlag;
}

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
    voteFlag: VoteFlag,
    name: Option[String],
    text: String,
    replyID: Option[String],
    profileID: Option[String],
    isReply: Option[Boolean]
) extends ResAPI;

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
    voteFlag: VoteFlag,
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
    voteFlag: VoteFlag
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
    voteFlag: VoteFlag,
    forkID: String
) extends ResAPI;

object ResForkAPI {
  implicit val eqImpl: Eq[ResForkAPI] = {
    import auto.eq._
    semi.eq
  }
}

final case class ResDeletePI(
    id: String,
    topicID: String,
    date: String,
    self: Option[Boolean],
    uv: Int,
    dv: Int,
    hash: String,
    replyCount: Int,
    voteFlag: VoteFlag,
    flag: ResDeleteReason
) extends ResAPI;

object ResDeletePI {
  implicit val eqImpl: Eq[ResDeletePI] = {
    import auto.eq._
    semi.eq
  }
}

final case class Reply(
    res: String,
    user: UserId
);

object Reply {
  implicit val eqImpl: Eq[Reply] = {
    import auto.eq._
    semi.eq
  }
}

sealed trait ResId extends Any {
  def value: String;
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
  import Res.ops._;
  private implicit def resImpl: Res[A] = this;

  type Self = A;
  type Id <: ResId;
  type TId <: TopicId;

  type SelfLens[T] = Lens[A, T]
  type SelfApplyLens[T] = ApplyLens[A, A, T, T]

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
    name: Option[String],
    text: String,
    reply: Option[Reply],
    deleteFlag: Option[ResDeleteReason],
    profile: Option[ProfileId],
    age: Boolean
);

object ResNormal {
  implicit val eqImpl: Eq[ResNormal] = {
    import auto.eq._
    semi.eq
  }

  implicit val resImpl = new Res[ResNormal] {
    type Id = ResNormalId;
    type TId = TopicId;

    override def idLens = GenLens[Self](_.id)
    override def topicLens = GenLens[Self](_.topic)
    override def dateLens = GenLens[Self](_.date)
    override def userLens = GenLens[Self](_.user)
    override def votesLens = GenLens[Self](_.votes)
    override def lvLens = GenLens[Self](_.lv)
    override def hashLens = GenLens[Self](_.hash)
    override def replyCountLens =
      GenLens[Self](_.replyCount)
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

    override def idLens = GenLens[Self](_.id)
    override def topicLens = GenLens[Self](_.topic)
    override def dateLens = GenLens[Self](_.date)
    override def userLens = GenLens[Self](_.user)
    override def votesLens = GenLens[Self](_.votes)
    override def lvLens = GenLens[Self](_.lv)
    override def hashLens = GenLens[Self](_.hash)
    override def replyCountLens =
      GenLens[Self](_.replyCount)
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

    override def idLens = GenLens[Self](_.id)
    override def topicLens = GenLens[Self](_.topic)
    override def dateLens = GenLens[Self](_.date)
    override def userLens = GenLens[Self](_.user)
    override def votesLens = GenLens[Self](_.votes)
    override def lvLens = GenLens[Self](_.lv)
    override def hashLens = GenLens[Self](_.hash)
    override def replyCountLens =
      GenLens[Self](_.replyCount)
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

    override def idLens = GenLens[Self](_.id)
    override def topicLens = GenLens[Self](_.topic)
    override def dateLens = GenLens[Self](_.date)
    override def userLens = GenLens[Self](_.user)
    override def votesLens = GenLens[Self](_.votes)
    override def lvLens = GenLens[Self](_.lv)
    override def hashLens = GenLens[Self](_.hash)
    override def replyCountLens =
      GenLens[Self](_.replyCount)
  }
}
