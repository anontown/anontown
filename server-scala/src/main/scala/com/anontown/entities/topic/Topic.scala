package com.anontown.entities.topic

import java.time.OffsetDateTime
import com.anontown.AtError
import com.anontown.ports.ClockComponent
import com.anontown.entities.res.Res
import com.anontown.entities.user.User

trait TopicAPI {
  val id: String;
  val title: String;
  val update: String;
  val date: String;
  val resCount: Int;
  val active: Boolean;
}

trait Topic {
  type IdType <: TopicId;

  val id: IdType;
  val title: TopicTitle;
  val update: OffsetDateTime;
  val date: OffsetDateTime;
  val resCount: Int;
  val ageUpdate: OffsetDateTime;
  val active: Boolean;

  def hash(user: User)(ports: ClockComponent) = { ??? }

  def resUpdate[R: Res](res: R): Either[AtError, Topic] = { ??? }
}
