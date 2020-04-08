package com.anontown.utils
import zio.ZIO

object ZIOUtils {
  implicit class ZIOToEither[-R, +E, +A](self: ZIO[R, E, A]) {
    def toEither: ZIO[R, Nothing, Either[E, A]] =
      this.self
        .map(Right(_))
        .catchAll(e => ZIO.succeed(Left(e)))
  }
}
