package com.anontown.entities.topic

import simulacrum._

@typeclass
trait TopicTemporaryId[A] extends TopicId[A] {}
