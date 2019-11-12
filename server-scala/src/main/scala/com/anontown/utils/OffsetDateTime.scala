package com.anontown.utils
import java.time.OffsetDateTime
import java.time.Instant
import java.time.ZoneOffset

object OffsetDateTimeUtils {
  def ofEpochMilli(milli: Long): OffsetDateTime = {
    OffsetDateTime.ofInstant(Instant.ofEpochMilli(milli), ZoneOffset.UTC)
  }

  implicit class OffsetDateTimeToEpochMilli(self: OffsetDateTime) {
    def toEpochMilli: Long = self.toInstant().toEpochMilli()
  }
}
