package com.anontown.application.resolvers

import sangria.macros.derive.GraphQLName
import sangria.macros.derive.GraphQLDescription
import sangria.schema.IDType
import sangria.macros._
import sangria.macros.derive._
import com.anontown.entities.DateTime
import com.anontown.application.resolvers.ScalarTypes.dateTimeType

sealed trait ResDeleteFlag;

object ResDeleteFlag {
  @GraphQLName("self")
  final case object Self extends ResDeleteFlag;
  @GraphQLName("freeze")
  final case object Freeze extends ResDeleteFlag;

  implicit val resDeleteFlagType = deriveEnumType[ResDeleteFlag]()
}
