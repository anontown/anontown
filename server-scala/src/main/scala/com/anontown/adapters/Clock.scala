package com.anontown.adapters
import com.anontown.ports.Clock
import java.time.OffsetDateTime

class ClockImpl(val requestDate: OffsetDateTime) extends Clock;
