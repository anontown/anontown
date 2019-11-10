package net.kgtkr.anontown;

import cats.data.ReaderT
import cats.data.Reader
import scala.util.chaining._
import cats.Id

package object utils {
  def runReaderT[R, F[_], A](fa: ReaderT[F, R, A]): Reader[R, F[A]] = {
    fa.run.pipe(Reader(_))
  }

  def runId[A](x: Id[A]): A = x

  def readerT[R, F[_], A](fa: Reader[R, F[A]]): ReaderT[F, R, A] = {
    fa.run
      .andThen(runId)
      .pipe(ReaderT(_))
  }

  @SuppressWarnings(Array("org.wartremover.warts.Throw"))
  def unreachable: Nothing = throw new Exception("unreachable")

  implicit class UtilReaderT[R, F[_], A](val fa: ReaderT[F, R, A])
      extends AnyVal {
    def runReaderT: Reader[R, F[A]] = utils.runReaderT(fa)
  }

  implicit class UtilReader[R, F[_], A](val fa: Reader[R, F[A]])
      extends AnyVal {
    def toReaderT: ReaderT[F, R, A] = utils.readerT(fa)
  }
}
