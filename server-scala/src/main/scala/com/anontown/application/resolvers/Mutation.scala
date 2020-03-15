package com.anontown.application.resolvers

import sangria.macros.derive.GraphQLField

class Mutation(ctx: Ctx) {
  @GraphQLField
  def dymmy = ""
}
