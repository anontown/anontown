package com.anontown.entities.topic

import cats._, cats.implicits._, cats.derived._

sealed trait TopicId {
  type Self <: TopicId;

  def value: String;
}

object TopicId {}

final case class UntaggedTopicId(value: String) extends TopicId {
  type Self = UntaggedTopicId;
}

object UntaggedTopicId {
  implicit val implEq: Eq[UntaggedTopicId] = {
    import auto.eq._
    semi.eq
  }

  def fromTopicId[A <: TopicId](x: A): UntaggedTopicId =
    UntaggedTopicId(x.value)
}

sealed trait TaggedTopicId extends TopicId {
  type Self <: TaggedTopicId;
}

object TaggedTopicId {
  implicit val implEq: Eq[TaggedTopicId] = {
    import auto.eq._
    semi.eq
  }
}

sealed trait TopicTemporaryId extends TopicId {
  type Self <: TopicTemporaryId;
}

object TopicTemporaryId {}

final case class UntaggedTopicTemporaryId(value: String)
    extends TopicTemporaryId {
  type Self = UntaggedTopicTemporaryId;
}

object UntaggedTopicTemporaryId {
  implicit val implEq: Eq[UntaggedTopicTemporaryId] = {
    import auto.eq._
    semi.eq
  }
}

sealed trait TaggedTopicTemporaryId
    extends TopicTemporaryId
    with TaggedTopicId {
  type Self <: TaggedTopicTemporaryId;
}

object TaggedTopicTemporaryId {
  implicit val implEq: Eq[TaggedTopicTemporaryId] = {
    import auto.eq._
    semi.eq
  }
}

sealed trait TopicSearchId extends TopicId {
  type Self <: TopicSearchId;
}

object TopicSearchId {}

final case class UntaggedTopicSearchId(value: String) extends TopicSearchId {
  type Self = UntaggedTopicSearchId;
}

object UntaggedTopicSearchId {
  implicit val implEq: Eq[UntaggedTopicSearchId] = {
    import auto.eq._
    semi.eq
  }
}

sealed trait TaggedTopicSearchId extends TopicSearchId with TaggedTopicId {
  type Self <: TaggedTopicSearchId;
}

object TaggedTopicSearchId {
  implicit val implEq: Eq[TaggedTopicSearchId] = {
    import auto.eq._
    semi.eq
  }
}

final case class TopicNormalId(value: String) extends TaggedTopicSearchId {
  type Self = TopicNormalId;
}

object TopicNormalId {
  implicit val implEq: Eq[TopicNormalId] = {
    import auto.eq._
    semi.eq
  }
}

final case class TopicOneId(value: String)
    extends TaggedTopicSearchId
    with TaggedTopicTemporaryId {
  type Self = TopicOneId;
}

object TopicOneId {
  implicit val implEq: Eq[TopicOneId] = {
    import auto.eq._
    semi.eq
  }
}

final case class TopicForkId(value: String) extends TaggedTopicTemporaryId {
  type Self = TopicForkId;
}

object TopicForkId {
  implicit val implEq: Eq[TopicForkId] = {
    import auto.eq._
    semi.eq
  }
}
