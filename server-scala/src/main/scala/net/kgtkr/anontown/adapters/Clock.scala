package net.kgtkr.anontown.adapters
import net.kgtkr.anontown.ports.Clock
import java.time.OffsetDateTime

class ClockImpl(val requestDate: OffsetDateTime) extends Clock;
