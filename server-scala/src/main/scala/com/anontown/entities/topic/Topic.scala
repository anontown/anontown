package com.anontown.entities.topic

import java.time.OffsetDateTime
import com.anontown.AtError
import com.anontown.ports.ClockComponent
import com.anontown.entities.res.Res
import com.anontown.entities.user.User
import monocle.syntax.ApplyLens
import simulacrum._
import shapeless._
import record._
import com.anontown.utils.Record._
import com.anontown.AuthToken
import Topic.ops._
import TopicId.ops._

trait TopicAPI {
  val id: String;
  val title: String;
  val update: String;
  val date: String;
  val resCount: Int;
  val active: Boolean;
}

@typeclass
trait Topic[A] extends AnyRef {
  type Self = A;
  type IdType;
  implicit val implTopicIdForIdType: TopicId[IdType];

  type API <: TopicAPI;

  type SelfApplyLens[T] = ApplyLens[A, A, T, T];

  def toAPI(self: A)(
      authToken: Option[AuthToken]
  ): API;

  def id(self: A): SelfApplyLens[IdType];
  def title(self: A): SelfApplyLens[TopicTitle];
  def update(self: A): SelfApplyLens[OffsetDateTime];
  def date(self: A): SelfApplyLens[OffsetDateTime];
  def resCount(self: A): SelfApplyLens[Int];
  def ageUpdate(self: A): SelfApplyLens[OffsetDateTime];
  def active(self: A): SelfApplyLens[Boolean];
}

object Topic {
  implicit class TopicService[A](val self: A)(
      implicit val implTopic: Topic[A]
  ) {
    import implTopic.implTopicIdForIdType

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
        id = self.id.get.value,
        title = self.title.get.value,
        update = self.update.get.toString,
        date = self.date.get.toString,
        resCount = self.resCount.get,
        active = self.active.get
      )
    }

    def hash(user: User)(ports: ClockComponent) = { ??? }

    def resUpdate[R: Res](res: R): Either[AtError, A] = { ??? }
  }
}
