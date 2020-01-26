package com.anontown.services
import zio.IO
import com.anontown.AtServerError

trait SafeIdGenerator {
  def generateSafeId(): IO[AtServerError, String];
}

trait SafeIdGeneratorComponent {
  val safeIdGenerator: SafeIdGenerator;
}
