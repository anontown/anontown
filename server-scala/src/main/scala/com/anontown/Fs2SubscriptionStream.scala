package com.anontown

import sangria.streaming.SubscriptionStream
import fs2.Stream
import scala.concurrent.Future
import cats.effect.IO
import cats.effect.ContextShift
import scala.concurrent.ExecutionContext

class Fs2SubscriptionStream(
    implicit ioContextShift: ContextShift[IO],
    ec: ExecutionContext
) extends SubscriptionStream[Stream[IO, *]] {
  import fs2._
  type IOStream[+A] = Stream[IO, A]

  def supported[S[_]](tc: SubscriptionStream[S]): Boolean =
    tc match {
      case _: Fs2SubscriptionStream => true
      case _                        => false
    }

  def single[A](a: A): IOStream[A] = Stream(a)
  def singleFuture[A](fa: Future[A]): IOStream[A] =
    Stream.eval(IO.fromFuture(IO(fa)))
  def first[A](s: IOStream[A]): Future[A] =
    s.take(1)
      .compile
      .last
      .unsafeToFuture
      .flatMap(x => x.map(Future(_)).getOrElse(Future.never))

  def failed[A](e: Throwable): IOStream[A] = Stream.raiseError[IO](e)
  def onComplete[Ctx, A](s: IOStream[A])(
      op: => Unit
  ): IOStream[A] = s.onFinalize(IO(op))
  def flatMapFuture[Ctx, B, A](fa: Future[A])(
      f: A => IOStream[B]
  ): IOStream[B] = Stream.eval(IO.fromFuture(IO(fa))).flatMap(f)
  def mapFuture[A, B](s: IOStream[A])(
      f: A => Future[B]
  ): IOStream[B] = s.evalMap(x => IO.fromFuture(IO(f(x))))
  def map[A, B](s: IOStream[A])(f: A => B): IOStream[B] = s.map(f)
  def merge[A](ss: Vector[IOStream[A]]): IOStream[A] =
    ss.foldLeft(Stream.empty: Stream[IO, A])(_.merge(_))
  def recover[A](s: IOStream[A])(f: Throwable => A): IOStream[A] =
    s.handleErrorWith(e => Stream.emit(f(e)))

}

object Fs2SubscriptionStream {
  implicit def fs2SubscriptionStream(
      implicit ioContextShift: ContextShift[IO],
      ec: ExecutionContext
  ): SubscriptionStream[Stream[IO, *]] =
    new Fs2SubscriptionStream()
}
