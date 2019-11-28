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

final case class TagsAPI(name: String, count: Int);
object TagsAPI {
  implicit val eqImpl: Eq[TagsAPI] = {
    import auto.eq._
    semi.eq
  }
}

sealed trait TopicAPI {
  val id: String;
  val title: String;
  val update: String;
  val date: String;
  val resCount: Int;
  val active: Boolean;
}

sealed trait TopicSearchAPI extends TopicAPI {
  val tags: List[String];
  val text: String;
}

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

final case class TopicOneAPI(
    id: String,
    title: String,
    update: String,
    date: String,
    resCount: Int,
    active: Boolean,
    tags: List[String],
    text: String
) extends TopicSearchAPI;

object TopicOneAPI {
  implicit val eqImpl: Eq[TopicOneAPI] = {
    import auto.eq._
    semi.eq
  }
}

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
  implicit val eqImpl: Eq[TopicForkAPI] = {
    import auto.eq._
    semi.eq
  }
}

sealed trait TopicId extends Any {
  def value: String;
}

sealed trait TopicSearchId extends Any with TopicId;
sealed trait TopicTemporaryId extends Any with TopicId;

final case class TopicForkId(value: String) extends AnyVal with TopicTemporaryId;
object TopicForkId {
  implicit val eqImpl: Eq[TopicForkId] = {
    import auto.eq._
    semi.eq
  }
}

final case class TopicNormalId(value: String) extends AnyVal with TopicSearchId;
object TopicNormalId {
  implicit val eqImpl: Eq[TopicNormalId] = {
    import auto.eq._
    semi.eq
  }
}

final case class TopicOneId(value: String)
    extends AnyVal
    with TopicSearchId
    with TopicTemporaryId;
object TopicOneId {
  implicit val eqImpl: Eq[TopicOneId] = {
    import auto.eq._
    semi.eq
  }
}

final case class TopicTitle(value: String) extends AnyVal;
object TopicTitle {
  implicit val eqImpl: Eq[TopicTitle] = {
    import auto.eq._
    semi.eq
  }
}

final case class TopicText(value: String) extends AnyVal;
object TopicText {
  implicit val eqImpl: Eq[TopicText] = {
    import auto.eq._
    semi.eq
  }
}

final case class TopicTag(value: String) extends AnyVal;
object TopicTag {
  implicit val eqImpl: Eq[TopicTag] = {
    import auto.eq._
    semi.eq
  }
}

final case class TopicTags(value: List[TopicTag]) extends AnyVal;
object TopicTags {
  implicit val eqImpl: Eq[TopicTags] = {
    import auto.eq._
    semi.eq
  }
}

sealed trait Topic {
  type Id <: TopicId;

  val id: Id;
  val title: TopicTitle;
  val update: OffsetDateTime;
  val date: OffsetDateTime;
  val resCount: Int;
  val ageUpdate: OffsetDateTime;
  val active: Boolean;

  def hash(user: User)(ports: ClockComponent) = { ??? }

  def resUpdate[R: Res](res: R): Either[AtError, Topic] = { ??? }
}

sealed trait TopicSearch extends Topic {
  type Id <: TopicSearchId;

  val tags: TopicTags;
  val text: TopicText;
}

sealed trait TopicTemporary extends Topic {
  type Id <: TopicTemporaryId;
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
) extends TopicSearch {
  type Id = TopicNormalId;
}

object TopicNormal {
  implicit val eqImpl: Eq[TopicNormal] = {
    import auto.eq._
    semi.eq
  }
}

final case class TopicOne(
    id: TopicOneId,
    title: TopicTitle,
    update: OffsetDateTime,
    date: OffsetDateTime,
    resCount: Int,
    ageUpdate: OffsetDateTime,
    active: Boolean,
    tags: TopicTags,
    text: TopicText
) extends TopicSearch
    with TopicTemporary {
  type Id = TopicOneId;
}

object TopicOne {
  implicit val eqImpl: Eq[TopicOne] = {
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
) extends Topic
    with TopicTemporary {
  type Id = TopicForkId;
}

object TopicFork {
  implicit val eqImpl: Eq[TopicFork] = {
    import auto.eq._
    semi.eq
  }
}
