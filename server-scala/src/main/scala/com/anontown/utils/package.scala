package com.anontown;

package object utils {
  object Record {
    import shapeless._
    import shapeless.tag._

    type ->>[L, T] = labelled.FieldType[Symbol @@ L, T]
  }

  def toIntOption(s: String): Option[Int] = {
    import scala.util.Try;
    Try(s.toInt).toOption
  }
}
