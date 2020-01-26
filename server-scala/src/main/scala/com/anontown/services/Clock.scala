package com.anontown.services;

import java.time.OffsetDateTime;

trait Clock {
  def requestDate: OffsetDateTime;
}

trait ClockComponent {
  val clock: Clock;
}
