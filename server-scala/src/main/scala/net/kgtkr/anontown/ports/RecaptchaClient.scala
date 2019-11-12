package net.kgtkr.anontown.ports
import net.kgtkr.anontown.AtError

trait RecaptchaClient {
  def verifyRecaptcha(apiParamRecaptcha: String): Either[AtError, Unit];
}

trait RecaptchaClientComponent {
  val recaptchaClient: RecaptchaClient;
}
