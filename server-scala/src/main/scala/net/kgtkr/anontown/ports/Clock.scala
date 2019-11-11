package net.kgtkr.anontown.ports;

import java.time.OffsetDateTime;

trait Clock {
  def now(): OffsetDateTime;
}
