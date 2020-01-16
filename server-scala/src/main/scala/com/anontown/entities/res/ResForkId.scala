package com.anontown.entities.res

import java.time.OffsetDateTime
import cats._, cats.implicits._, cats.derived._
import com.anontown.utils.Impl._;
import zio.ZIO
import com.anontown.AtError
import com.anontown.ports.ObjectIdGeneratorComponent
import com.anontown.ports.ClockComponent
import com.anontown.AtRightError
import com.anontown.AuthToken
import com.anontown.AtPrerequisiteError
import simulacrum._
import monocle.macros.syntax.lens._
import monocle.syntax.ApplyLens
import Res.ops._;
import shapeless._
import record._
import com.anontown.utils.Record._
import com.anontown.entities.user.{UserId, User}
import com.anontown.entities.topic.{
  TopicId,
  Topic,
  TopicNormalId,
  TopicTemporaryId,
  TopicNormal,
  TopicTemporary,
  TopicForkId,
  TopicFork
}
import com.anontown.entities.profile.{ProfileId, Profile}
import com.anontown.entities.history.{HistoryId, History}

final case class ResForkId(value: String) extends AnyVal with ResId;

object ResForkId {
  implicit val eqImpl: Eq[ResForkId] = {
    import auto.eq._
    semi.eq
  }
}
