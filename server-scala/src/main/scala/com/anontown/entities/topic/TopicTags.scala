package com.anontown.entities.topic

import cats._, cats.implicits._, cats.derived._
import cats.data.NonEmptyList;
import com.anontown.AtParamsError
import com.anontown.AtParamsErrorItem

final case class TopicTags(value: List[TopicTag]) extends AnyVal;
object TopicTags {
  val tagMax: Int = 15;

  implicit val implEq: Eq[TopicTags] = {
    import auto.eq._
    semi.eq
  }

  def fromStringList(
      value: List[String]
  ): Either[AtParamsError, TopicTags] = {
    ((if (value.size =!= value.distinct.size) {
        Left(
          AtParamsError(
            NonEmptyList(AtParamsErrorItem("tags", "タグの重複があります"), List())
          )
        )
      } else {
        Right(())
      }).toValidated, (if (value.size > tagMax) {
                         Left(
                           AtParamsError(
                             NonEmptyList(
                               AtParamsErrorItem("tags", "タグの個数は15以内にしてください"),
                               List()
                             )
                           )
                         )
                       } else {
                         Right(())
                       }).toValidated, (value.mapWithIndex {
      case (tag, i) =>
        TopicTag.fromString(f"tags[${i.toString()}]", tag).toValidated
    }).sequence)
      .mapN((_, _, x) => TopicTags(x))
      .toEither
  }
}
