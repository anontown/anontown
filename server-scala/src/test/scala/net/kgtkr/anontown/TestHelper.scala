package net.kgtkr.anontown
import zio.ZIO
import zio.internal.PlatformLive
import zio.Runtime

object TestHelper {
  def runZioTest[R, E, A](ports: R)(zio: ZIO[R, E, A]): Unit = {
    Runtime(
      ports,
      PlatformLive.Default
    ).unsafeRun(zio);
    ()
  }
}
