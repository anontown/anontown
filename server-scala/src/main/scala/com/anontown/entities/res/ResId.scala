package com.anontown.entities.res

import cats._, cats.implicits._, cats.derived._

sealed trait ResId {
  type Self <: ResId;
  def value: String;
}

object ResId {}

final case class UntaggedResId(value: String) extends ResId {
  type Self = UntaggedResId;
}

object UntaggedResId {
  implicit val implEq: Eq[UntaggedResId] = {
    import auto.eq._
    semi.eq
  }

  def fromResId[A <: ResId](x: A): UntaggedResId = UntaggedResId(x.value)
}

sealed trait TaggedResId extends ResId {
  type Self <: TaggedResId;
}

object TaggedResId {
  implicit val implEq: Eq[TaggedResId] = {
    import auto.eq._
    semi.eq
  }
}

final case class ResForkId(value: String) extends TaggedResId {
  type Self = ResForkId;
}

object ResForkId {
  implicit val implEq: Eq[ResForkId] = {
    import auto.eq._
    semi.eq
  }
}

final case class ResHistoryId(value: String) extends TaggedResId {
  type Self = ResHistoryId;
}

object ResHistoryId {
  implicit val implEq: Eq[ResHistoryId] = {
    import auto.eq._
    semi.eq
  }
}

final case class ResNormalId(value: String) extends TaggedResId {
  type Self = ResNormalId;
}

object ResNormalId {
  implicit val implEq: Eq[ResNormalId] = {
    import auto.eq._
    semi.eq
  }
}

final case class ResTopicId(value: String) extends TaggedResId {
  type Self = ResTopicId;
}

object ResTopicId {
  implicit val implEq: Eq[ResTopicId] = {
    import auto.eq._
    semi.eq
  }
}
