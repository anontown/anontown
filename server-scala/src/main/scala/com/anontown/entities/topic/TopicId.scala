package com.anontown.entities.topic

import cats.implicits._

trait TopicId extends Any {
  def value: String;

  def topicIdEquals(other: TopicId): Boolean = {
    this.value === other.value
  }
}
