package com.anontown
import zio.ZIO
import zio.internal.PlatformLive
import zio.Runtime
import java.time.OffsetDateTime
import com.anontown.utils.OffsetDateTimeUtils
import com.anontown.services.ObjectIdGeneratorAlg
import com.anontown.services.ClockAlg
import com.anontown.services.SafeIdGeneratorAlg
import com.anontown.services.ConfigContainerAlg
import com.anontown.adapters.DummyObjectIdGeneratorImpl
import com.anontown.adapters.ClockImpl
import com.anontown.adapters.DummySafeIdGeneratorImpl
import com.anontown.adapters.DummyConfigContainerImpl

object TestHelper {
  def runZio[R, E, A](ports: R)(zio: ZIO[R, E, A]): A = {
    Runtime(
      ports,
      PlatformLive.Default
    ).unsafeRun(zio)
  }

  def createPorts(
      requestDate: OffsetDateTime = OffsetDateTimeUtils.ofEpochMilli(0),
      safeIdIt: Iterator[String] = Iterator.empty,
      objectIdIt: Iterator[String] = Iterator.empty
  ) =
    new ObjectIdGeneratorAlg with ClockAlg with ConfigContainerAlg
    with SafeIdGeneratorAlg {
      val objectIdGenerator =
        new DummyObjectIdGeneratorImpl(objectIdIt)

      val clock = new ClockImpl(requestDate)

      val safeIdGenerator = new DummySafeIdGeneratorImpl(safeIdIt)

      val configContainer = new DummyConfigContainerImpl()
    }
}
