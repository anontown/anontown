package com.anontown.application.resolvers

import sangria.macros.derive.GraphQLName
import sangria.macros.derive._

sealed trait ResDeleteFlag;

object ResDeleteFlag {
  @GraphQLName("self")
  final case object Self extends ResDeleteFlag;
  @GraphQLName("freeze")
  final case object Freeze extends ResDeleteFlag;

  implicit val resDeleteFlagType = deriveEnumType[ResDeleteFlag]()
}
