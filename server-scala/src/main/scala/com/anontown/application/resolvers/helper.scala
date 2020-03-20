package com.anontown.application.resolvers

import sangria.schema.Field
import sangria.schema.Context
import sangria.schema.Action
import sangria.schema.OutputType

object Helper {
  def field[Ctx, Val, Out](
      name: String,
      resolve: Context[Ctx, Val] => Action[Ctx, Out]
  )(
      implicit outputType: OutputType[Out]
  ): Field[Ctx, Val] =
    Field[Ctx, Val, Out, Out](name, outputType, resolve = resolve)
}
