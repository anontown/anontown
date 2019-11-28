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
import monocle.macros.GenLens
import com.anontown.macros.lensTypeClass

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
@lensTypeClass
@typeclass
trait Res[A] {
  import Res.ops._;
  private implicit def resImpl: Res[A] = this;

  type Id <: ResId;
  type TId <: TopicId;

  def idLens: Lens[A, Id];
  def topicLens: Lens[A, TId];
  def dateLens: Lens[A, OffsetDateTime];
  def userLens: Lens[A, UserId];
  def votesLens: Lens[A, List[Vote]];
  def lvLens: Lens[A, Int];
  def hashLens: Lens[A, String];
  def replyCountLens: Lens[A, Int];

  def v(self: A)(
      resUser: User,
      user: User,
      vtype: VoteType,
      authToken: AuthToken
  ): Either[AtError, (A, User)] = {
    assert(resUser.id === self.user);
    assert(user.id === authToken.user);

    val voted = self.votes.find(_.user === user.id);
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
    assert(resUser.id === self.user);
    assert(user.id === authToken.user);

    if (user.id === self.user) {
      Left(new AtRightError("自分に投票は出来ません"));
    } else if (self.votes.find(_.user === user.id).isDefined) {
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
          self
            .modifyVotes(
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
    assert(resUser.id === self.user);
    assert(user.id === authToken.user);

    val vote = self.votes.find(_.user === user.id);
    vote match {
      case Some(vote) => {
        val newResUser = resUser.changeLv(resUser.lv - vote.value);
        Right(
          (
            self.modifyVotes(_.filter(_.user =!= user.id)),
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

    override def idLens = GenLens[ResNormal](_.id)
    override def topicLens = GenLens[ResNormal](_.topic)
    override def dateLens = GenLens[ResNormal](_.date)
    override def userLens = GenLens[ResNormal](_.user)
    override def votesLens = GenLens[ResNormal](_.votes)
    override def lvLens = GenLens[ResNormal](_.lv)
    override def hashLens = GenLens[ResNormal](_.hash)
    override def replyCountLens = GenLens[ResNormal](_.replyCount)
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
    type Self = ResHistory;
    type Id = ResHistoryId;
    type TId = TopicNormalId;

    override def idLens = GenLens[ResHistory](_.id)
    override def topicLens = GenLens[ResHistory](_.topic)
    override def dateLens = GenLens[ResHistory](_.date)
    override def userLens = GenLens[ResHistory](_.user)
    override def votesLens = GenLens[ResHistory](_.votes)
    override def lvLens = GenLens[ResHistory](_.lv)
    override def hashLens = GenLens[ResHistory](_.hash)
    override def replyCountLens = GenLens[ResHistory](_.replyCount)
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

    override def idLens = GenLens[ResTopic](_.id)
    override def topicLens = GenLens[ResTopic](_.topic)
    override def dateLens = GenLens[ResTopic](_.date)
    override def userLens = GenLens[ResTopic](_.user)
    override def votesLens = GenLens[ResTopic](_.votes)
    override def lvLens = GenLens[ResTopic](_.lv)
    override def hashLens = GenLens[ResTopic](_.hash)
    override def replyCountLens = GenLens[ResTopic](_.replyCount)
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

    override def idLens = GenLens[ResFork](_.id)
    override def topicLens = GenLens[ResFork](_.topic)
    override def dateLens = GenLens[ResFork](_.date)
    override def userLens = GenLens[ResFork](_.user)
    override def votesLens = GenLens[ResFork](_.votes)
    override def lvLens = GenLens[ResFork](_.lv)
    override def hashLens = GenLens[ResFork](_.hash)
    override def replyCountLens = GenLens[ResFork](_.replyCount)
  }
}
