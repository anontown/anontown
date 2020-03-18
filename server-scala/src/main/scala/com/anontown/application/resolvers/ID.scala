package com.anontown.application.resolvers

import sangria.schema.ScalarAlias
import sangria.schema.IDType

final case class ID(value: String);

object ID {
  implicit val idType =
    ScalarAlias[ID, String](IDType, _.value, id => Right(ID(id)))
}
