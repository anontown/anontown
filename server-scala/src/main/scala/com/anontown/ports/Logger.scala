package com.anontown.ports;

import cats.tagless._

@finalAlg
trait LoggerAlg[F[_]] {
  def error(msg: String): F[Unit];
  def warn(msg: String): F[Unit];
  def info(msg: String): F[Unit];
  def verbose(msg: String): F[Unit];
  def debug(msg: String): F[Unit];
  def silly(msg: String): F[Unit];
}
