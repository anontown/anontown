package com.anontown.entities.token

import cats.implicits._

trait TokenId {
  val value: String;

  def tokenIdEquals(other: TokenId): Boolean = {
    this.value === other.value
  }
}
