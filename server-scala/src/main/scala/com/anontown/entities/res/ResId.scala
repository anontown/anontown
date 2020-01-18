package com.anontown.entities.res

import cats.implicits._

trait ResId extends Any {
  def value: String;

  def resIdEquals(other: ResId): Boolean = {
    this.value === other.value
  }
}
