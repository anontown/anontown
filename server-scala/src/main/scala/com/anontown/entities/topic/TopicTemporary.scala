package com.anontown.entities.topic

trait TopicTemporary extends Topic {
  type Id <: TopicTemporaryId;
}
