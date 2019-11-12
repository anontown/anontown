package net.kgtkr.anontown.ports
import zio.IO
import net.kgtkr.anontown.AtError

trait RecaptchaClient {
  def verifyRecaptcha(apiParamRecaptcha: String): IO[AtError, Unit];
}

trait RecaptchaClientComponent {
  val recaptchaClient: RecaptchaClient;
}
