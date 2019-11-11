package net.kgtkr.anontown.ports;

trait Logger {
  def error(msg: String): Unit;
  def warn(msg: String): Unit;
  def info(msg: String): Unit;
  def verbose(msg: String): Unit;
  def debug(msg: String): Unit;
  def silly(msg: String): Unit;
}
