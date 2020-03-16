package com.anontown.application.resolvers

import sangria.schema.ScalarType
import sangria.validation.ValueCoercionViolation
import sangria.ast
import com.anontown.entities.DateTime

case object DateTimeCoercionViolation
    extends ValueCoercionViolation("DateTime value expected(ISO 8601)")

object ScalarTypes {
  val DateTimeType = ScalarType[DateTime](
    "DateTime",
    coerceOutput = (d, _) => d.toString(),
    coerceUserInput = {
      case s: String =>
        DateTime
          .parse(s)
          .map(Right(_))
          .getOrElse(Left(DateTimeCoercionViolation))
      case _ => Left(DateTimeCoercionViolation)
    },
    coerceInput = {
      case ast.StringValue(s, _, _, _, _) =>
        DateTime
          .parse(s)
          .map(Right(_))
          .getOrElse(Left(DateTimeCoercionViolation))
      case _ ⇒ Left(DateTimeCoercionViolation)
    }
  )
}
