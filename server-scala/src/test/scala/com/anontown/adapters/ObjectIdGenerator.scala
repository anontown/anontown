package com.anontown.adapters
import com.anontown.services.ObjectIdGenerator
import zio.IO
import com.anontown.AtServerError

class DummyObjectIdGeneratorImpl(val objectIdIt: Iterator[String])
    extends ObjectIdGenerator {
  override def generateObjectId(): IO[AtServerError, String] =
    IO.succeed(objectIdIt.next())
}
