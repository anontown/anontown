package net.kgtkr.anontown.ports
import zio.IO
import net.kgtkr.anontown.AtServerError

trait SafeIdGenerator {
  def generateSafeId(): IO[AtServerError, String];
}

trait SafeIdGeneratorComponent {
  val safeIdGenerator: SafeIdGenerator;
}
