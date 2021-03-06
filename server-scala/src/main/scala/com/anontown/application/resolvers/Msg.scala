package com.anontown.application.resolvers

import sangria.macros.derive._
import com.anontown.entities.DateTime
import com.anontown.application.resolvers.ScalarTypes.dateTimeType

final case class Msg(
    id: ID,
    priv: Option[Boolean],
    text: String,
    date: DateTime
);

object Msg {
  implicit val msgType = deriveObjectType[Ctx, Msg]()
}
