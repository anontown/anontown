package com.anontown.application.resolvers

import sangria.schema.ObjectType
import sangria.schema._
import sangria.schema.Action
import cats.effect.ContextShift
import scala.concurrent.ExecutionContext
import cats.effect.IO
import com.anontown.Fs2SubscriptionStream.fs2SubscriptionStream

object Subscription {
  def subscriptionType(
      implicit ioContextShift: ContextShift[IO],
      ec: ExecutionContext
  ) = {
    ObjectType(
      "Subscription",
      fields[Ctx, Unit](
        Field.subs(
          "dummy",
          IntType,
          resolve = ctx => fs2.Stream.emit[IO, Int](1).map(Action(_))
        )
      )
    )
  }
}
