package com.anontown.adapters
import com.anontown.ports.SafeIdGenerator
import zio.IO
import com.anontown.AtServerError
import zio.ZIO

class DummySafeIdGenerator(val safeIdIt: Iterator[String])
    extends SafeIdGenerator {
  def generateSafeId(): IO[AtServerError, String] = {
    ZIO.succeed(safeIdIt.next())
  }
}
