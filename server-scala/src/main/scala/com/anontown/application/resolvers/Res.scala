package com.anontown.application.resolvers

import sangria.macros.derive.GraphQLName
import sangria.macros.derive.GraphQLDescription
import sangria.macros.derive.GraphQLExclude
import sangria.schema.IDType
import sangria.macros._
import sangria.macros.derive._
import com.anontown.entities.DateTime
import com.anontown.application.resolvers.ScalarTypes.dateTimeType
import sangria.schema.InterfaceType
import sangria.schema.Field
import sangria.schema.OptionType
import sangria.schema.BooleanType
import sangria.schema.IntType
import sangria.schema.StringType

sealed trait Res {
  val id: ID;
  val topicId: String;
  val date: DateTime;
  val self: Option[Boolean]
  val uv: Int
  val dv: Int
  val hash: String
  val replyCount: Int
  val voteFlag: Option[VoteFlag]
}

object Res {
  implicit val resType: InterfaceType[Ctx, Res] =
    InterfaceType(
      "Res",
      () =>
        List(
          Field(
            "id",
            ID.idType,
            resolve = _.value.id
          ),
          Field(
            "date",
            dateTimeType,
            resolve = _.value.date
          ),
          Field(
            "self",
            OptionType(BooleanType),
            resolve = _.value.self
          ),
          Field(
            "uv",
            IntType,
            resolve = _.value.uv
          ),
          Field(
            "dv",
            IntType,
            resolve = _.value.dv
          ),
          Field(
            "hash",
            StringType,
            resolve = _.value.hash
          ),
          Field(
            "replyCount",
            IntType,
            resolve = _.value.replyCount
          ),
          Field(
            "voteFlag",
            OptionType(VoteFlag.voteFlagType),
            resolve = _.value.voteFlag
          )
          // TODO: topic: Topic!
        )
    )
}
