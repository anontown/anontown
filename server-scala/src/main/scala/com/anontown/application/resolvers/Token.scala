package com.anontown.application.resolvers

import com.anontown.entities.DateTime

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

sealed trait Token {
  val id: ID;
  val key: String;
  val date: DateTime;
}

object Token {
  def tokenResolvers[A <: Token](fields: Field[Ctx, A]*): List[Field[Ctx, A]] =
    List[Field[Ctx, A]](
      Helper.field[ID, Unit].apply("id", (), (ctx, _) => ctx.value.id),
      Helper.field[String, Unit].apply("key", (), (ctx, _) => ctx.value.key),
      Helper
        .field[DateTime, Unit]
        .apply("date", (), (ctx, _) => ctx.value.date)
    ) ++ fields.toList

  implicit val tokenType: InterfaceType[Ctx, Token] =
    InterfaceType(
      "Token",
      () => tokenResolvers()
    )
}

final case class TokenMaster(id: ID, key: String, date: DateTime) extends Token;

object TokenMaster {
  implicit val tokenMasterType: ObjectType[Ctx, TokenMaster] =
    ObjectType[Ctx, TokenMaster](
      name = "TokenMaster",
      interfaces =
        interfaces(PossibleInterface[Ctx, TokenMaster](Token.tokenType)),
      fieldsFn = () => Token.tokenResolvers[TokenMaster]()
    )
}

final case class TokenGeneral(id: ID, key: String, date: DateTime, clientId: ID)
    extends Token;

object TokenGeneral {
  implicit val tokenGeneralType: ObjectType[Ctx, TokenGeneral] =
    ObjectType[Ctx, TokenGeneral](
      name = "TokenGeneral",
      interfaces =
        interfaces(PossibleInterface[Ctx, TokenGeneral](Token.tokenType)),
      fieldsFn = () =>
        Token.tokenResolvers[TokenGeneral](
          /* client: Client! */
        )
    )
}
