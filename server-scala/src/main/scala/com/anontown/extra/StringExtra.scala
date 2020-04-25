package com.anontown.extra

class StringExtra(val self: String) extends AnyVal {
  def toIntOption: Option[Int] = {
    import scala.util.Try;
    Try(self.toInt).toOption
  }
}
