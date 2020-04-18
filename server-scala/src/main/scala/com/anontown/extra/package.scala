package com.anontown

package object extra {
  implicit class StringExtra(s: String) {
    def toIntOption: Option[Int] = {
      import scala.util.Try;
      Try(s.toInt).toOption
    }
  }

  object RecordExtra {
    import shapeless._
    import shapeless.tag._

    type ->>[L, T] = labelled.FieldType[Symbol @@ L, T]
  }
}
