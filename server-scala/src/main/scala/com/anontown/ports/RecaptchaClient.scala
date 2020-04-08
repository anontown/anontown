package com.anontown.ports
import com.anontown.AtError
import cats.data.EitherT
import cats.tagless._

@finalAlg
trait RecaptchaClientAlg[F[_]] {
  def verifyRecaptcha(apiParamRecaptcha: String): EitherT[F, AtError, Unit];
}
