package com.anontown.services

import cats.tagless.finalAlg
import java.security.MessageDigest;
import java.util.Base64;
import scala.util.chaining._;
import cats.Monad

@finalAlg
trait HashAlg[F[_]] {
  def sha256(s: String): F[String];
}

class Hash[F[_]: Monad] {
  def sha256(s: String): F[String] = {
    Monad[F].pure(
      MessageDigest
        .getInstance("SHA-256")
        .digest(s.getBytes("UTF-8"))
        .pipe(Base64.getEncoder.encodeToString(_))
        .replaceAll("=", "")
    )
  }
}
