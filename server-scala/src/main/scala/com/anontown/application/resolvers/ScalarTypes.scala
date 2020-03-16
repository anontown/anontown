package com.anontown.application.resolvers

import sangria.schema.ScalarType
import java.time.OffsetDateTime
import sangria.validation.ValueCoercionViolation
import sangria.ast
import java.time.format.DateTimeFormatter
import scala.util.Try

case object DateTimeCoercionViolation
    extends ValueCoercionViolation("DateTime value expected(ISO 8601)")

object ScalarTypes {
  val DateTimeType = ScalarType[OffsetDateTime](
    "DateTime",
    coerceOutput = (d, _) => d.toString(),
    coerceUserInput = {
      case s: String =>
        Try(OffsetDateTime.parse(s, DateTimeFormatter.ISO_OFFSET_DATE_TIME)).toEither.left
          .map(_ => DateTimeCoercionViolation)
      case _ => Left(DateTimeCoercionViolation)
    },
    coerceInput = {
      case ast.StringValue(s, _, _, _, _) =>
        Try(OffsetDateTime.parse(s, DateTimeFormatter.ISO_OFFSET_DATE_TIME)).toEither.left
          .map(_ => DateTimeCoercionViolation)
      case _ ⇒ Left(DateTimeCoercionViolation)
    }
  )
}
