package net.kgtkr.anontown.ports;
import zio.IO
import net.kgtkr.anontown.AtServerError

trait ObjectIdGenerator {
  def generateObjectId(): IO[AtServerError, String];
}

trait ObjectIdGeneratorComponent {
  val objectIdGenerator: ObjectIdGenerator;
}
