package com.anontown.application.resolvers

import sangria.macros.derive.GraphQLName
import sangria.macros.derive.GraphQLDescription
import sangria.macros.derive.GraphQLOutputType
import sangria.macros.derive.GraphQLExclude
import sangria.schema.IDType
import sangria.macros._
import sangria.macros.derive._
import com.anontown.entities.DateTime
import com.anontown.application.resolvers.ScalarTypes.dateTimeType

final case class Res(
    @GraphQLOutputType(IDType) id: String,
    @GraphQLExclude topicId: String,
    date: DateTime,
    self: Option[Boolean],
    uv: Int,
    dv: Int,
    hash: String,
    replyCount: Int,
    voteFlag: Option[VoteFlag]
) {
  // TODO: topic: Topic!
}

object Res {
  implicit val resType = deriveObjectType[Ctx, Res]()
}
