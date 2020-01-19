package com.anontown.entities.res

import java.time.OffsetDateTime
import cats._, cats.implicits._, cats.derived._
import zio.ZIO
import com.anontown.AtError
import com.anontown.ports.ObjectIdGeneratorComponent
import com.anontown.ports.ClockComponent
import com.anontown.AtRightError
import com.anontown.AuthToken
import com.anontown.AtPrerequisiteError
import monocle.macros.syntax.lens._
import Res.ops._;
import shapeless._
import record._
import com.anontown.entities.user.{UserId, User}
import com.anontown.entities.topic.{TopicId, Topic}
import com.anontown.entities.profile.{ProfileId, Profile}
import com.anontown.entities.topic.Topic.ops._
import com.anontown.entities.topic.Topic.TopicService
import com.anontown.entities.res.ResId.ops._

sealed trait ResNormalAPI extends ResAPI;

final case class ResNormalActiveAPI(
    id: String,
    topicID: String,
    date: String,
    self: Option[Boolean],
    uv: Int,
    dv: Int,
    hash: String,
    replyCount: Int,
    voteFlag: Option[VoteFlag],
    name: Option[String],
    text: String,
    replyID: Option[String],
    profileID: Option[String],
    isReply: Option[Boolean]
) extends ResAPI
    with ResNormalAPI;

object ResNormalActiveAPI {
  implicit val eqImpl: Eq[ResNormalActiveAPI] = {
    import auto.eq._
    semi.eq
  }
}

final case class ResNormalDeleteAPI(
    id: String,
    topicID: String,
    date: String,
    self: Option[Boolean],
    uv: Int,
    dv: Int,
    hash: String,
    replyCount: Int,
    voteFlag: Option[VoteFlag],
    flag: ResDeleteReason
) extends ResAPI
    with ResNormalAPI;

object ResNormalDeleteAPI {
  implicit val eqImpl: Eq[ResNormalDeleteAPI] = {
    import auto.eq._
    semi.eq
  }
}

final case class ResNormal[+ReplyResId: ResId](
    id: ResNormalId,
    topic: TopicId,
    date: OffsetDateTime,
    user: UserId,
    votes: List[Vote],
    lv: Int,
    hash: String,
    replyCount: Int,
    name: Option[ResName],
    text: ResText,
    reply: Option[Reply[ReplyResId]],
    deleteFlag: Option[ResDeleteReason],
    profile: Option[ProfileId],
    age: Boolean
) {
  def del(
      resUser: User,
      authToken: AuthToken
  ): Either[AtError, (ResNormal[ReplyResId], User)] = {
    assert(resUser.id === authToken.user);
    for {
      _ <- Either.cond(
        authToken.user === this.user,
        (),
        new AtRightError("人の書き込み削除は出来ません")
      )

      _ <- Either.cond(
        this.deleteFlag.isEmpty,
        (),
        new AtPrerequisiteError("既に削除済みです")
      )

      val newResUser = resUser.changeLv(resUser.lv - 1)
    } yield (
      (
        this.copy(
          deleteFlag = Some(ResDeleteReason.Self())
        ),
        newResUser
      )
    )
  }
}

object ResNormal {
  implicit def resImpl[ReplyResId: ResId] = new Res[ResNormal[ReplyResId]] {
    type IdType = ResNormalId;
    val resIdImpl = implicitly[ResId[IdType]]

    type TopicIdType = TopicId;
    type API = ResNormalAPI;

    override def id(self: Self) = self.lens(_.id)
    override def topic(self: Self) = self.lens(_.topic)
    override def date(self: Self) = self.lens(_.date)
    override def user(self: Self) = self.lens(_.user)
    override def votes(self: Self) = self.lens(_.votes)
    override def lv(self: Self) = self.lens(_.lv)
    override def hash(self: Self) = self.lens(_.hash)
    override def replyCount(self: Self) =
      self.lens(_.replyCount)

    override def fromBaseAPI(
        self: Self
    )(authToken: Option[AuthToken], base: ResAPIBaseRecord): API = {
      self.deleteFlag match {
        case None =>
          LabelledGeneric[ResNormalActiveAPI].from(
            base.merge(
              Record(
                name = self.name.map(_.value),
                text = self.text.value,
                replyID = self.reply.map(_.res.value),
                profileID = self.profile.map(_.value),
                isReply = authToken.flatMap(
                  authToken => self.reply.map(authToken.user === _.user)
                )
              )
            )
          )
        case Some(deleteFlag) =>
          LabelledGeneric[ResNormalDeleteAPI].from(
            base.merge(
              Record(
                flag = deleteFlag
              )
            )
          )
      }
    }
  }

  def create[ResIdType: ResId, ResType, TopicType: Topic](
      topic: TopicType,
      user: User,
      authUser: AuthToken,
      name: Option[String],
      text: String,
      reply: Option[ResType],
      profile: Option[Profile],
      age: Boolean
  )(implicit resImpl: Res[ResType] { type IdType = ResIdType }): ZIO[
    ObjectIdGeneratorComponent with ClockComponent,
    AtError,
    (ResNormal[ResIdType], User, TopicType)
  ] = {
    assert(user.id === authUser.user);
    for {
      (name, text) <- ZIO.fromEither(
        (
          name
            .map(ResName.fromString(_).map(Some(_)))
            .getOrElse(Right(None))
            .toValidated,
          ResText.fromString(text).toValidated
        ).mapN((_, _)).toEither
      )

      _ <- ZIO.fromEither(
        Either.cond(
          profile.map(_.user === user.id).getOrElse(true),
          (),
          new AtRightError("自分のプロフィールを指定して下さい。")
        )
      )

      // もしリプ先があるかつ、トピックがリプ先と違えばエラー
      _ <- ZIO.fromEither(
        Either.cond(
          // TODO: id.valueしなくても比較できるようにする
          reply
            .map(reply => reply.topic.get topicIdEquals topic.id.get)
            .getOrElse(true),
          (),
          new AtPrerequisiteError("他のトピックのレスへのリプは出来ません")
        )
      )

      requestDate <- ZIO.access[ClockComponent](_.clock.requestDate)

      newUser <- ZIO.fromEither(user.changeLastRes(requestDate))

      id <- ZIO.accessM[ObjectIdGeneratorComponent](
        _.objectIdGenerator.generateObjectId()
      )

      hash <- ZIO.access[ClockComponent](topic.hash(newUser)(_))

      val result = ResNormal(
        name = name,
        text = text,
        reply =
          reply.map(reply => Reply(res = reply.id.get, user = reply.user.get)),
        deleteFlag = None,
        profile = profile.map(_.id),
        age = age,
        id = ResNormalId(id),
        topic = topic.id.get,
        date = requestDate,
        user = newUser.id,
        votes = List(),
        lv = newUser.lv * 5,
        hash = hash,
        replyCount = 0
      )
      newTopic <- ZIO.fromEither(topic.resUpdate(result))
    } yield (result, newUser, newTopic)
  }
}
