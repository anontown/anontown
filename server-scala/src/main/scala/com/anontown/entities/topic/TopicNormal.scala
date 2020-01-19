package com.anontown.entities.topic

import cats._, cats.implicits._, cats.derived._
import com.anontown.utils.Impl._;
import java.time.OffsetDateTime
import monocle.macros.syntax.lens._

final case class TopicNormalAPI(
    id: String,
    title: String,
    update: String,
    date: String,
    resCount: Int,
    active: Boolean,
    tags: List[String],
    text: String
) extends TopicSearchAPI;

object TopicNormalAPI {
  implicit val eqImpl: Eq[TopicNormalAPI] = {
    import auto.eq._
    semi.eq
  }
}
final case class TopicNormal(
    id: TopicNormalId,
    title: TopicTitle,
    update: OffsetDateTime,
    date: OffsetDateTime,
    resCount: Int,
    ageUpdate: OffsetDateTime,
    active: Boolean,
    tags: TopicTags,
    text: TopicText
);

object TopicNormal {
  implicit val eqImpl: Eq[TopicNormal] = {
    import auto.eq._
    semi.eq
  }

  implicit val topicImpl = new TopicSearch[TopicNormal] {
    type IdType = TopicNormalId;

    override def id(self: Self) = self.lens(_.id);
    override def title(self: Self) = self.lens(_.title);
    override def update(self: Self) = self.lens(_.update);
    override def date(self: Self) = self.lens(_.date);
    override def resCount(self: Self) = self.lens(_.resCount);
    override def ageUpdate(self: Self) = self.lens(_.ageUpdate);
    override def active(self: Self) = self.lens(_.active);
    override def tags(self: Self) = self.lens(_.tags);
    override def text(self: Self) = self.lens(_.text);
  }
}
