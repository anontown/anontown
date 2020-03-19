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
import sangria.schema.ObjectType
import sangria.schema.PossibleInterface
import sangria.schema.interfaces

sealed trait Res {
  val id: ID;
  val topicId: ID;
  val date: DateTime;
  val self: Option[Boolean]
  val uv: Int
  val dv: Int
  val hash: String
  val replyCount: Int
  val voteFlag: Option[VoteFlag]
}

object Res {
  def resResolvers[A <: Res]: List[Field[Ctx, A]] = List(
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

  implicit val resType: InterfaceType[Ctx, Res] =
    InterfaceType(
      "Res",
      () => resResolvers
    )
}

final case class ResNormal(
    id: ID,
    topicId: ID,
    date: DateTime,
    self: Option[Boolean],
    uv: Int,
    dv: Int,
    hash: String,
    replyCount: Int,
    voteFlag: Option[VoteFlag],
    name: Option[String],
    text: String,
    replyId: Option[ID],
    profileId: Option[ID],
    isReply: Option[Boolean]
) extends Res;

object ResNormal {
  implicit val resNormalType: ObjectType[Ctx, ResNormal] =
    ObjectType[Ctx, ResNormal](
      name = "ResNormal",
      interfaces = interfaces(PossibleInterface[Ctx, ResNormal](Res.resType)),
      fieldsFn = () =>
        Res.resResolvers[ResNormal] ++ List[Field[Ctx, ResNormal]](
          Field(
            "name",
            OptionType(StringType),
            resolve = _.value.name
          ),
          Field(
            "text",
            StringType,
            resolve = _.value.text
          ),
          /*
          TODO:
          reply: Res
          profile: Profile

           */
          Field(
            "isReply",
            OptionType(BooleanType),
            resolve = _.value.isReply
          )
        )
    )
}
