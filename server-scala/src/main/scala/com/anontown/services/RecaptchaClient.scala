package com.anontown.services
import zio.IO
import com.anontown.AtError

trait RecaptchaClient {
  def verifyRecaptcha(apiParamRecaptcha: String): IO[AtError, Unit];
}

trait RecaptchaClientComponent {
  val recaptchaClient: RecaptchaClient;
}
