package net.kgtkr.anontown;

package object utils {
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
