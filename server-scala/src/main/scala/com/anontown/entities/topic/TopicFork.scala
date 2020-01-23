package com.anontown.entities.topic

import cats._, cats.implicits._, cats.derived._
import com.anontown.utils.Impl._;
import java.time.OffsetDateTime
import monocle.macros.syntax.lens._

final case class TopicForkAPI(
    id: String,
    title: String,
    update: String,
    date: String,
    resCount: Int,
    active: Boolean,
    parentID: String
) extends TopicAPI;

object TopicForkAPI {
  implicit val implEq: Eq[TopicForkAPI] = {
    import auto.eq._
    semi.eq
  }
}
final case class TopicFork(
    id: TopicForkId,
    title: TopicTitle,
    update: OffsetDateTime,
    date: OffsetDateTime,
    resCount: Int,
    ageUpdate: OffsetDateTime,
    active: Boolean,
    parent: TopicNormalId
);

object TopicFork {
  implicit val implTopic = new TopicTemporary[TopicFork] {
    type IdType = TopicForkId;

    val implTopicIdForIdType = implicitly

    override def id(self: Self) = self.lens(_.id);
    override def title(self: Self) = self.lens(_.title);
    override def update(self: Self) = self.lens(_.update);
    override def date(self: Self) = self.lens(_.date);
    override def resCount(self: Self) = self.lens(_.resCount);
    override def ageUpdate(self: Self) = self.lens(_.ageUpdate);
    override def active(self: Self) = self.lens(_.active);
  }

  implicit val implEq: Eq[TopicFork] = {
    import auto.eq._
    semi.eq
  }
}
