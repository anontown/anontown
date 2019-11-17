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

final case class Vote(user: String, value: Int);

object Vote {
  implicit val eqImpl: Eq[Vote] = {
    import auto.eq._
    semi.eq
  }
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

sealed trait ResId {
  val value: String;
}

final case class ResNormalId(value: String) extends ResId;

object ResNormalId {
  implicit val eqImpl: Eq[ResNormalId] = {
    import auto.eq._
    semi.eq
  }
}

final case class ResHistoryId(value: String) extends ResId;

object ResHistoryId {
  implicit val eqImpl: Eq[ResHistoryId] = {
    import auto.eq._
    semi.eq
  }
}

final case class ResTopicId(value: String) extends ResId;

object ResTopicId {
  implicit val eqImpl: Eq[ResTopicId] = {
    import auto.eq._
    semi.eq
  }
}

final case class ResForkId(value: String) extends ResId;

object ResForkId {
  implicit val eqImpl: Eq[ResForkId] = {
    import auto.eq._
    semi.eq
  }
}

sealed trait Res {
  type Id <: ResId;

  val id: Id;
  val topic: String;
  val date: OffsetDateTime;
  val user: UserId;
  val votes: List[Vote];
  val lv: Int;
  val hash: String;
  val replyCount: Int;
}

final case class ResNormal(
    id: ResNormalId,
    topic: String,
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
  type Id = ResNormalId;
}

object ResNormal {
  implicit val eqImpl: Eq[ResNormal] = {
    import auto.eq._
    semi.eq
  }
}

final case class ResHistory(
    id: ResHistoryId,
    topic: String,
    date: OffsetDateTime,
    user: UserId,
    votes: List[Vote],
    lv: Int,
    hash: String,
    replyCount: Int,
    history: HistoryId
) extends Res {
  type Id = ResHistoryId;
}

object ResHistory {
  implicit val eqImpl: Eq[ResHistory] = {
    import auto.eq._
    semi.eq
  }
}

final case class ResTopic(
    id: ResTopicId,
    topic: String,
    date: OffsetDateTime,
    user: UserId,
    votes: List[Vote],
    lv: Int,
    hash: String,
    replyCount: Int
) extends Res {
  type Id = ResTopicId;
}

object ResTopic {
  implicit val eqImpl: Eq[ResTopic] = {
    import auto.eq._
    semi.eq
  }
}

final case class ResFork(
    id: ResForkId,
    topic: String,
    date: OffsetDateTime,
    user: UserId,
    votes: List[Vote],
    lv: Int,
    hash: String,
    replyCount: Int,
    fork: String
) extends Res {
  type Id = ResForkId;
}

object ResFork {
  implicit val eqImpl: Eq[ResFork] = {
    import auto.eq._
    semi.eq
  }
}
