package com.anontown.entities.res

sealed trait ResADT[+ReplyResIdType, +TopicIdType];
object ResADT {
  final case class Fork(value: ResFork) extends ResADT[Nothing, Nothing];
  final case class History(value: ResHistory) extends ResADT[Nothing, Nothing];
  final case class Normal[+ReplyResIdType, +TopicIdType](
      value: ResNormal[ReplyResIdType, TopicIdType]
  ) extends ResADT[ReplyResIdType, TopicIdType];
  final case class ResTopic(value: ResFork) extends ResADT[Nothing, Nothing];
}
