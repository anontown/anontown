package com.anontown.entities.topic

import cats.implicits._

trait TopicTemporaryId extends Any with TopicId {
  def topicTemporaryIdEquals(other: TopicTemporaryId): Boolean = {
    this.value === other.value
  }
}
