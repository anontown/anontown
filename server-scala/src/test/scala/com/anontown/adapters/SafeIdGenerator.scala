package com.anontown.adapters
import com.anontown.services.SafeIdGenerator
import zio.IO
import com.anontown.AtServerError
import zio.ZIO

class DummySafeIdGeneratorImpl(val safeIdIt: Iterator[String])
    extends SafeIdGenerator {
  def generateSafeId(): IO[AtServerError, String] = {
    ZIO.succeed(safeIdIt.next())
  }
}
