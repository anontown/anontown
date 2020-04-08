package com.anontown.application.resolvers

import sangria.macros.derive._

final case class TokenReq(
    token: ID,
    key: String
);

object TokenReq {
  implicit val tokenReqType = deriveObjectType[Ctx, TokenReq]()
}
