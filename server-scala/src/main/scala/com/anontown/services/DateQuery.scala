package com.anontown.services

import java.time.OffsetDateTime
import cats._, cats.derived._

final case class DateQuery(date: OffsetDateTime, type_ : DateType);

sealed trait DateType;
object DateType {
  implicit val implEq: Eq[DateType] = {
    import auto.eq._
    semi.eq
  }

  final case class Gt() extends DateType
  final case class Gte() extends DateType
  final case class Lt() extends DateType
  final case class Lte() extends DateType
}
