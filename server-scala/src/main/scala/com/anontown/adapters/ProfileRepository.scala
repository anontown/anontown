package com.anontown.adapters

import com.anontown.ports.ProfileRepositoryAlg
import org.mongodb.scala._
import cats.effect.IO
import cats.data.EitherT
import com.anontown.AtError
import cats.effect.ContextShift
import com.anontown.entities.user.UserId
import com.anontown.entities.DateTime
import org.bson.types.ObjectId
import java.{util => ju}
import org.mongodb.scala.model.Filters
import com.anontown.AtNotFoundError
import com.anontown.adapters.extra._
import com.anontown.entities.profile.{Profile, ProfileId}
import com.anontown.entities.profile.Profile
import com.anontown.entities.profile.ProfileName
import com.anontown.entities.profile.ProfileSn
import com.anontown.entities.profile.ProfileText
import com.anontown.AtConflictError

class ProfileRepository(db: MongoDatabase)(implicit cs: ContextShift[IO])
    extends ProfileRepositoryAlg[IO] {
  val collection = db.getCollection[Document]("profiles")

  def findOne(id: ProfileId): EitherT[IO, AtError, Profile] = {
    for {
      profile <- EitherT
        .fromOptionF(
          collection.findOneIO(Filters.eq("_id", new ObjectId(id.value))),
          new AtNotFoundError("プロフィールが存在しません"): AtError
        )
        .map(ProfileRepository.fromDocument(_))
    } yield profile
  }

  def find(
      ids: Option[List[ProfileId]],
      users: Option[List[UserId]]
  ): EitherT[IO, AtError, List[Profile]] = {
    for {
      result <- EitherT
        .right[AtError](
          collection
            .findIO(
              Filters.and(
                List(
                  users.map(
                    users =>
                      Filters
                        .in(
                          "user",
                          users.map(user => new ObjectId(user.value)): _*
                        )
                  ),
                  ids.map(
                    ids =>
                      Filters
                        .in(
                          "_id",
                          ids.map(id => new ObjectId(id.value)): _*
                        )
                  )
                ).flatten: _*
              )
            )
        )
        .map(
          profiles => profiles.map(x => ProfileRepository.fromDocument(x))
        )
    } yield result
  }

  def insert(profile: Profile): EitherT[IO, AtError, Unit] = {
    EitherT(
      collection
        .insertOneIO(ProfileRepository.toDocument(profile))
        .map(Right(_))
        .handleErrorWith {
          case _: DuplicateKeyException =>
            IO.pure(Left(new AtConflictError("スクリーンネームが使われています"): AtError))
          case e => IO.raiseError(e)
        }
    )
  }

  def update(profile: Profile): EitherT[IO, AtError, Unit] = {
    EitherT(
      collection
        .replaceOneIO(
          Filters.eq("_id", new ObjectId(profile.id.value)),
          ProfileRepository.toDocument(profile)
        )
        .map(Right(_))
        .handleErrorWith {
          case _: DuplicateKeyException =>
            IO.pure(Left(new AtConflictError("スクリーンネームが使われています"): AtError))
          case e => IO.raiseError(e)
        }
    )
  }

}

object ProfileRepository {
  def fromDocument(document: Document): Profile = {
    Profile(
      id = ProfileId(document.getObjectId("_id").toHexString()),
      user = UserId(document.getObjectId("user").toHexString()),
      name = ProfileName(document.getString("name")),
      text = ProfileText(document.getString("text")),
      date = DateTime.fromInstant(document.getDate("date").toInstant()),
      update = DateTime.fromInstant(document.getDate("update").toInstant()),
      sn = ProfileSn(document.getString("sn"))
    )
  }

  def toDocument(profile: Profile): Document = {
    Document(
      "_id" -> new ObjectId(profile.id.value),
      "user" -> profile.user.value,
      "name" -> profile.name.value,
      "text" -> profile.text.value,
      "date" -> ju.Date.from(profile.date.toInstant),
      "update" -> ju.Date.from(profile.update.toInstant),
      "sn" -> profile.sn.value
    )
  }
}
