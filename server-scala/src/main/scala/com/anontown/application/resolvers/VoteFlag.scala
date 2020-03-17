package com.anontown.application.resolvers

import sangria.macros.derive.GraphQLName
import sangria.macros.derive.GraphQLDescription
import sangria.macros.derive.GraphQLOutputType
import sangria.schema.IDType
import sangria.macros._
import sangria.macros.derive._
import com.anontown.entities.DateTime
import com.anontown.application.resolvers.ScalarTypes.dateTimeType

sealed trait VoteFlag;

object VoteFlag {
  @GraphQLName("uv")
  final case object UV extends VoteFlag;
  @GraphQLName("dv")
  final case object DV extends VoteFlag;
  @GraphQLName("not")
  final case object Not extends VoteFlag;

  implicit val voteFlagType = deriveEnumType[VoteFlag]()
}
