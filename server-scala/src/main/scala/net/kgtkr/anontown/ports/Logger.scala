package net.kgtkr.anontown.ports;
import zio.IO
import net.kgtkr.anontown.AtServerError

trait Logger {
  def error(msg: String): IO[AtServerError, Unit];
  def warn(msg: String): IO[AtServerError, Unit];
  def info(msg: String): IO[AtServerError, Unit];
  def verbose(msg: String): IO[AtServerError, Unit];
  def debug(msg: String): IO[AtServerError, Unit];
  def silly(msg: String): IO[AtServerError, Unit];
}

trait LoggerComponent {
  val logger: Logger;
}
