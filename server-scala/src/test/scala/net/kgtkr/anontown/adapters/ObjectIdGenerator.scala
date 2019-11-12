package net.kgtkr.anontown.adapters
import net.kgtkr.anontown.ports.ObjectIdGenerator
import zio.IO
import net.kgtkr.anontown.AtServerError

class DummyObjectIdGenerator(val value: String) extends ObjectIdGenerator {
  override def generateObjectId(): IO[AtServerError, String] = IO.succeed(value)
}
