package com.anontown.application.resolvers

import sangria.schema._
import sangria.execution._
import sangria.macros._
import sangria.marshalling.circe._
import scala.concurrent.ExecutionContext.Implicits.global
import sangria.macros.derive._

object AppSchema {
  def getSchema(): Schema[Ctx, Unit] = {
    val queryType =
      deriveContextObjectType[Ctx, Query, Unit](ctx => new Query(ctx))
    val mutationType =
      deriveContextObjectType[Ctx, Mutation, Unit](ctx => new Mutation(ctx))
    Schema(query = queryType, mutation = Some(mutationType))

  }
}
