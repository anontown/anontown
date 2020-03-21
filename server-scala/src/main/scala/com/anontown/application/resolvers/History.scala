package com.anontown.application.resolvers

import sangria.macros.derive.GraphQLExclude
import com.anontown.entities.DateTime
import sangria.macros.derive._
import com.anontown.application.resolvers.ScalarTypes.dateTimeType

final case class History(
    id: ID,
    @GraphQLExclude topicId: String,
    title: String,
    tags: List[String],
    text: String,
    date: DateTime,
    hash: String,
    self: Option[Boolean]
) {
  // TODO: topic: TopicNormal
}

object History {
  implicit val historyType = deriveObjectType[Ctx, History]()
}
