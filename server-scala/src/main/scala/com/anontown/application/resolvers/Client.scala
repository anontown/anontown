package com.anontown.application.resolvers

import sangria.macros.derive.GraphQLName
import sangria.macros.derive.GraphQLDescription
import sangria.macros.derive.GraphQLOutputType
import sangria.schema.IDType
import sangria.macros._
import sangria.macros.derive._
import com.anontown.entities.DateTime
import com.anontown.application.resolvers.ScalarTypes.dateTimeType

final case class Client(
    @GraphQLOutputType(IDType)
    id: String,
    name: String,
    url: String,
    self: Option[Boolean],
    date: DateTime,
    update: DateTime
);

object Client {
  implicit val clientType = deriveObjectType[Ctx, Client]()
}
