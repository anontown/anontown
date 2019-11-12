package com.anontown.adapters
import com.anontown.ports.ObjectIdGenerator
import zio.IO
import com.anontown.AtServerError

class DummyObjectIdGenerator(val value: String) extends ObjectIdGenerator {
  override def generateObjectId(): IO[AtServerError, String] = IO.succeed(value)
}
