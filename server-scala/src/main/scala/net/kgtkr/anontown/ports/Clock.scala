package net.kgtkr.anontown.ports;

import java.time.OffsetDateTime;

trait Clock {
  def requestDate: OffsetDateTime;
}

trait ClockComponent {
  val clock: Clock;
}
