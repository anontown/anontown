package com.anontown.entities.topic

import cats.implicits._

trait TopicSearchId extends Any with TopicId {
  def topicSearchIdEquals(other: TopicSearchId): Boolean = {
    this.value === other.value
  }
}
