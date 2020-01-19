package com.anontown.entities.res

import simulacrum._

@typeclass
trait ResId[A] {
  type Self = A;

  def value(self: A): String;
}
