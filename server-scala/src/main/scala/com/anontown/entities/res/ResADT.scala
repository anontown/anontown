package com.anontown.entities.res

import com.anontown.entities.topic.AnyTopicId

sealed trait ResADT;
object ResADT {
  final case class Fork(value: ResFork) extends ResADT;
  final case class History(value: ResHistory) extends ResADT;
  final case class Normal(
      value: ResNormal[AnyResId, AnyTopicId]
  ) extends ResADT;
  final case class ResTopic(value: ResFork) extends ResADT;
}
