package com.anontown.ports

import cats._, cats.derived._
import com.anontown.entities.DateTime

final case class DateQuery(date: DateTime, type_ : DateType);

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
