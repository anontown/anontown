package com.anontown.application.resolvers

import sangria.schema._
import sangria.execution._
import sangria.macros._
import sangria.marshalling.circe._
import sangria.macros.derive._
import cats.effect.ContextShift
import cats.effect.IO
import scala.concurrent.ExecutionContext

object AppSchema {
  def createSchema()(
      implicit ec: ExecutionContext,
      ioContextShift: ContextShift[IO]
  ): Schema[Ctx, Unit] = {
    val queryType =
      deriveContextObjectType[Ctx, Query, Unit](ctx => new Query(ctx))
    val mutationType =
      deriveContextObjectType[Ctx, Mutation, Unit](ctx => new Mutation(ctx))
    Schema(
      query = queryType,
      mutation = Some(mutationType),
      subscription = Some(Subscription.subscriptionType)
    )

  }
}
