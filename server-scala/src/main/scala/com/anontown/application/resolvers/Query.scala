package com.anontown.application.resolvers

import sangria.macros.derive.GraphQLField

class Query(ctx: Ctx) {
  @GraphQLField
  def dymmy = ""
}
