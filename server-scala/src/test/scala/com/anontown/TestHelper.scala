package com.anontown
import zio.ZIO
import zio.internal.PlatformLive
import zio.Runtime
import java.time.OffsetDateTime
import com.anontown.utils.OffsetDateTimeUtils
import com.anontown.services.ObjectIdGeneratorComponent
import com.anontown.services.ClockComponent
import com.anontown.services.SafeIdGeneratorComponent
import com.anontown.services.ConfigContainerComponent
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
    new ObjectIdGeneratorComponent with ClockComponent
    with ConfigContainerComponent with SafeIdGeneratorComponent {
      val objectIdGenerator =
        new DummyObjectIdGeneratorImpl(objectIdIt)

      val clock = new ClockImpl(requestDate)

      val safeIdGenerator = new DummySafeIdGeneratorImpl(safeIdIt)

      val configContainer = new DummyConfigContainerImpl()
    }
}
