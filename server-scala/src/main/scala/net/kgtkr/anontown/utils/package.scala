package net.kgtkr.anontown;

package object utils {
  object Impl {
    import java.time.OffsetDateTime
    import cats.Eq
    import cats.Show

    implicit val eqOffsetDateTime: Eq[OffsetDateTime] = Eq.fromUniversalEquals
    implicit val showOffsetDateTime: Show[OffsetDateTime] = Show.fromToString
  }

  def hash(str: String): String = {
    import java.security.MessageDigest;
    import java.util.Base64;
    import scala.util.chaining._;

    MessageDigest
      .getInstance("SHA-256")
      .digest(str.getBytes("UTF-8"))
      .pipe(Base64.getEncoder.encodeToString)
      .replaceAll("=", "")
  }

  def toIntOption(s: String): Option[Int] = {
    import scala.util.Try;
    Try(s.toInt).toOption
  }
}
