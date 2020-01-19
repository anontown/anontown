package com.anontown.entities.token

import java.time.OffsetDateTime
import com.anontown.utils;
import com.anontown.ports.SafeIdGeneratorComponent
import zio.ZIO
import com.anontown.AtServerError
import com.anontown.ports.ConfigContainerComponent
import com.anontown.entities.user.UserId

trait TokenAPI {
  val id: String
  val key: String
  val date: String
}

trait Token {
  type IdType <: TokenId

  val id: IdType;
  val key: String;
  val user: UserId;
  val date: OffsetDateTime;

  type API <: TokenAPI;

  // toBaseAPIどう実装しよう
  def toAPI(): API = {
    this.fromBaseAPI(
      id = Token.this.id.value,
      key = Token.this.key,
      date = Token.this.date.toString()
    )
  }

  def fromBaseAPI(id: String, key: String, date: String): API;
}

object Token {
  def createTokenKey(): ZIO[
    SafeIdGeneratorComponent with ConfigContainerComponent,
    AtServerError,
    String
  ] = {
    for {
      genId <- ZIO.accessM[SafeIdGeneratorComponent](
        _.safeIdGenerator.generateSafeId()
      )

      tokenSalt <- ZIO.access[ConfigContainerComponent](
        _.configContainer.config.salt.token
      )
    } yield utils.hash(genId + tokenSalt)
  }
}
