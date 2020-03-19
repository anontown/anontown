package com.anontown.application.resolvers

import sangria.macros.derive.GraphQLName
import sangria.macros.derive.GraphQLDescription
import sangria.schema.IDType
import sangria.macros._
import sangria.macros.derive._
import com.anontown.entities.DateTime
import com.anontown.application.resolvers.ScalarTypes.dateTimeType

final case class Profile(
    id: ID,
    self: Option[Boolean],
    name: String,
    text: String,
    date: DateTime,
    update: DateTime,
    sn: String
);

object Profile {
  implicit val profileType = deriveObjectType[Ctx, Profile]()
}
