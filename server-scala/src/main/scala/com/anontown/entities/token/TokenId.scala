package com.anontown.entities.token

import cats.implicits._

trait TokenId {
  val value: String;

  def equals_id(other: TokenId): Boolean = {
    this.value === other.value
  }
}
