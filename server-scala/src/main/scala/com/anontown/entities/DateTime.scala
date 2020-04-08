package com.anontown.entities

import java.time.Instant
import java.time.OffsetDateTime
import java.time.ZoneId
import java.time.ZoneOffset
import cats.effect.IO
import scala.util.Try
import java.time.format.DateTimeFormatter
import cats.Show
import cats.kernel.Eq
import cats.kernel.Order
import cats.implicits._

final case class DateTime(epochMilli: Long) {
  def toInstant: Instant = Instant.ofEpochMilli(this.epochMilli)

  def toOffsetDateTime(zoneId: ZoneId = ZoneOffset.UTC): OffsetDateTime =
    OffsetDateTime.ofInstant(this.toInstant, zoneId)

  def +(interval: Interval): DateTime =
    DateTime(this.epochMilli + interval.milli)

  def -(interval: Interval): DateTime =
    DateTime(this.epochMilli - interval.milli)

  override def toString: String = this.toOffsetDateTime().toString()
}

object DateTime {
  implicit val show: Show[DateTime] = Show.fromToString
  implicit val eq: Eq[DateTime] = Eq.fromUniversalEquals
  implicit val order: Order[DateTime] = Order.by(_.epochMilli)

  def fromInstant(instant: Instant): DateTime = DateTime(instant.toEpochMilli)

  def fromOffsetDateTime(offsetDateTime: OffsetDateTime): DateTime =
    DateTime.fromInstant(offsetDateTime.toInstant())

  def now(): IO[DateTime] = IO(DateTime.fromInstant(Instant.now()))

  def parse(s: String): Option[DateTime] =
    Try(OffsetDateTime.parse(s, DateTimeFormatter.ISO_OFFSET_DATE_TIME)).toOption
      .map(DateTime.fromOffsetDateTime(_))
}
