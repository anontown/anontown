package com.anontown.entities.topic

import cats._, cats.implicits._, cats.derived._

final case class TagsAPI(name: String, count: Int);
object TagsAPI {
  implicit val eqImpl: Eq[TagsAPI] = {
    import auto.eq._
    semi.eq
  }
}
