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
  object Uv {
    implicit val eqImpl: Eq[Uv] = {
      import auto.eq._
      semi.eq
    }
  }

  final case class Dv() extends VoteFlag;
  object Dv {
    implicit val eqImpl: Eq[Dv] = {
      import auto.eq._
      semi.eq
    }
  }

  final case class Not() extends VoteFlag;
  object Not {
    implicit val eqImpl: Eq[Not] = {
      import auto.eq._
      semi.eq
    }
  }
}

sealed trait ResDeleteReason;
object ResDeleteReason {
  final case class Self() extends ResDeleteReason;
  object Self {
    implicit val eqImpl: Eq[Self] = {
      import auto.eq._
      semi.eq
    }
  }

  final case class Freeze() extends ResDeleteReason;
  object Freeze {
    implicit val eqImpl: Eq[Freeze] = {
      import auto.eq._
      semi.eq
    }
  }
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

sealed trait Res {
  type Id <: ResId;
  type TId <: TopicId;
  type Self <: Res;

  val id: Id;
  val topic: TId;
  val date: OffsetDateTime;
  val user: UserId;
  val votes: List[Vote];
  val lv: Int;
  val hash: String;
  val replyCount: Int;

  def self: Self;
  def withVotes(votes: List[Vote]): Self;

  def v(
      resUser: User,
      user: User,
      vtype: VoteType,
      authToken: AuthToken
  ): Either[AtError, (Self#Self, User)] = {
    assert(resUser.id === this.user);
    assert(user.id === authToken.user);

    val voted = this.votes.find(_.user === user.id);
    for {
      data <- voted match {
        case Some(voted)
            if ((voted.value > 0 && vtype === VoteType
              .Uv()) || (voted.value < 0 && vtype === VoteType
              .Dv())) =>
          this.cv(resUser, user, authToken)
        case _ => Right((this.self, resUser))
      }

      result <- data._1._v(data._2, user, vtype, authToken)
    } yield result
  }

  // 既に投票していたらエラー
  def _v(
      resUser: User,
      user: User,
      vtype: VoteType,
      authToken: AuthToken
  ): Either[AtError, (Self, User)] = {
    assert(resUser.id === this.user);
    assert(user.id === authToken.user);

    if (user.id === this.user) {
      Left(new AtRightError("自分に投票は出来ません"));
    } else if (this.votes.find(_.user === user.id).isDefined) {
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
          this
            .withVotes(
              this.votes.appended(Vote(user = user.id, value = value))
            ),
          newResUser
        )
      )
    }
  }

  def cv(
      resUser: User,
      user: User,
      authToken: AuthToken
  ): Either[AtError, (Self, User)] = {
    assert(resUser.id === this.user);
    assert(user.id === authToken.user);

    val vote = this.votes.find(_.user === user.id);
    vote match {
      case Some(vote) => {
        val newResUser = resUser.changeLv(resUser.lv - vote.value);
        Right(
          (this.withVotes(this.votes.filter(_.user =!= user.id)), newResUser)
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
) extends Res {
  type Self = ResNormal;
  type Id = ResNormalId;
  type TId = TopicId;

  override def withVotes(votes: List[Vote]): Self = {
    this.copy(votes = votes)
  }
}

object ResNormal {
  implicit val eqImpl: Eq[ResNormal] = {
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
) extends Res {
  type Self = ResHistory;
  type Id = ResHistoryId;
  type TId = TopicNormalId;

  override def withVotes(votes: List[Vote]): Self = {
    this.copy(votes = votes)
  }
}

object ResHistory {
  implicit val eqImpl: Eq[ResHistory] = {
    import auto.eq._
    semi.eq
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
) extends Res {
  type Self = ResTopic;
  type Id = ResTopicId;
  type TId = TopicTemporaryId;

  override def withVotes(votes: List[Vote]): Self = {
    this.copy(votes = votes)
  }
}

object ResTopic {
  implicit val eqImpl: Eq[ResTopic] = {
    import auto.eq._
    semi.eq
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
  type Id = ResForkId;
  type TId = TopicNormalId;

  override def withVotes(votes: List[Vote]): Self = {
    this.copy(votes = votes)
  }
}

object ResFork {
  implicit val eqImpl: Eq[ResFork] = {
    import auto.eq._
    semi.eq
  }
}
