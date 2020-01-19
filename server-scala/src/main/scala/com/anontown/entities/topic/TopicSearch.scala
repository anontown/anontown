package com.anontown.entities.topic

trait TopicSearchAPI extends TopicAPI {
  val tags: List[String];
  val text: String;
}

trait TopicSearch extends Topic {
  type IdType <: TopicSearchId;

  val tags: TopicTags;
  val text: TopicText;
}
