package com.anontown.entities.token

import simulacrum._

@typeclass
trait TokenId[A] {
  type Self = A;

  def value(self: A): String;
}
