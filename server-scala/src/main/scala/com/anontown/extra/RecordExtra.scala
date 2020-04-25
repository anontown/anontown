package com.anontown.extra

object RecordExtra {
  import shapeless._
  import shapeless.tag._

  type ->>[L, T] = labelled.FieldType[Symbol @@ L, T]
}
