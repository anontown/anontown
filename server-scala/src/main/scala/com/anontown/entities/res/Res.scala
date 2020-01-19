package com.anontown.entities.res

import java.time.OffsetDateTime
import cats.implicits._
import com.anontown.AtError
import com.anontown.AtRightError
import com.anontown.AuthToken
import com.anontown.AtPrerequisiteError
import simulacrum._
import monocle.syntax.ApplyLens
import Res.ops._;
import shapeless._
import record._
import com.anontown.utils.Record._
import com.anontown.entities.user.{UserId, User}
import com.anontown.entities.topic.TopicId

trait ResAPI {
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

@typeclass
trait Res[A] {
  type Self = A;
  type Id <: ResId;
  type TId <: TopicId;
  type API <: ResAPI;

  type SelfApplyLens[T] = ApplyLens[A, A, T, T]
  type ResBaseAPIRecord =
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
      api: ResBaseAPIRecord
  ): API;

  def id(self: A): SelfApplyLens[Id];
  def topic(self: A): SelfApplyLens[TId];
  def date(self: A): SelfApplyLens[OffsetDateTime];
  def user(self: A): SelfApplyLens[UserId];
  def votes(self: A): SelfApplyLens[List[Vote]];
  def lv(self: A): SelfApplyLens[Int];
  def hash(self: A): SelfApplyLens[String];
  def replyCount(self: A): SelfApplyLens[Int];
}

trait ResService {
  implicit class ResImplicits[A](val self: A)(implicit val res: Res[A]) {
    def toAPI(authToken: Option[AuthToken]): res.API = {
      self.fromBaseAPI(
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
                .map(
                  vote =>
                    if (vote.value > 0) VoteFlag.Uv()
                    else VoteFlag.Dv()
                )
                .getOrElse(VoteFlag.Not())
          )
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
      assert(resUser.id === self.user.get);
      assert(user.id === authToken.user);

      if (user.id === self.user.get) {
        Left(new AtRightError("自分に投票は出来ません"));
      } else if (self.votes.get.find(_.user === user.id).isDefined) {
        Left(new AtPrerequisiteError("既に投票しています"))
      } else {
        val valueAbs = (user.lv.toDouble / 100.0).floor.toInt + 1;
        val value = vtype match {
          case VoteType.Uv() => valueAbs;
          case VoteType.Dv() => -valueAbs;
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

    def resetAndVote(
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

        result <- data._1.vote(data._2, user, vtype, authToken)
      } yield result
    }

    def cv(
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
}
