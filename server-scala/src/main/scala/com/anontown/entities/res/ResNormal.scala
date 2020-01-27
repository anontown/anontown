package com.anontown.entities.res

import java.time.OffsetDateTime
import cats._, cats.implicits._, cats.derived._
import com.anontown.AtError
import com.anontown.services.ObjectIdGeneratorAlg
import com.anontown.services.ClockAlg
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
import com.anontown.entities.topic.AnyTopicId
import Res.ResService
import cats.data.EitherT
import com.anontown.services.ConfigContainerAlg

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
  implicit val implEq: Eq[ResNormalActiveAPI] = {
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
  implicit val implEq: Eq[ResNormalDeleteAPI] = {
    import auto.eq._
    semi.eq
  }
}

final case class ResNormal[+ReplyResId, TopicIdType](
    id: ResNormalId,
    topic: TopicIdType,
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
);

object ResNormal {
  implicit def implResId[ReplyResId: ResId, TopicIdTy: TopicId]
      : Res[ResNormal[ReplyResId, TopicIdTy]] {
        type IdType = ResNormalId;
        type TopicIdType = TopicIdTy;
        type API = ResNormalAPI;
      } =
    new Res[ResNormal[ReplyResId, TopicIdTy]] {
      type IdType = ResNormalId;
      val implResIdForIdType = implicitly

      type TopicIdType = TopicIdTy;
      val implTopicIdForTopicIdType = implicitly

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

      override def toAPI(
          self: Self
      )(authToken: Option[AuthToken]): API = {
        self.deleteFlag match {
          case None =>
            LabelledGeneric[ResNormalActiveAPI].from(
              self
                .resAPIIntrinsicProperty(authToken)
                .merge(
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
              self
                .resAPIIntrinsicProperty(authToken)
                .merge(
                  Record(
                    flag = deleteFlag
                  )
                )
            )
        }
      }
    }

  def create[F[_]: Monad: ObjectIdGeneratorAlg: ClockAlg: ConfigContainerAlg, ResIdType: ResId, ResType, TopicType](
      topic: TopicType,
      user: User,
      authUser: AuthToken,
      name: Option[String],
      text: String,
      reply: Option[ResType],
      profile: Option[Profile],
      age: Boolean
  )(implicit implRes: Res[ResType] { type IdType = ResIdType }, implTopic: Topic[TopicType])
      : EitherT[
        F,
        AtError,
        (ResNormal[ResIdType, implTopic.IdType], User, TopicType)
      ] = {
    assert(user.id === authUser.user);

    import implRes.implTopicIdForTopicIdType
    import implTopic.implTopicIdForIdType

    for {
      (name, text) <- EitherT
        .fromEither[F](
          (
            name
              .map(ResName.fromString(_).map(Some(_)))
              .getOrElse(Right(None))
              .toValidated,
            ResText.fromString(text).toValidated
          ).mapN((_, _)).toEither
        )
        .leftWiden[AtError]

      _ <- EitherT
        .fromEither[F](
          Either.cond(
            profile.map(_.user === user.id).getOrElse(true),
            (),
            new AtRightError("自分のプロフィールを指定して下さい。")
          )
        )
        .leftWiden[AtError]

      // もしリプ先があるかつ、トピックがリプ先と違えばエラー
      _ <- EitherT
        .fromEither[F](
          Either.cond(
            reply
              .map(
                reply =>
                  AnyTopicId(reply.topic.get) === AnyTopicId(topic.id.get)
              )
              .getOrElse(true),
            (),
            new AtPrerequisiteError("他のトピックのレスへのリプは出来ません")
          )
        )
        .leftWiden[AtError]

      requestDate <- EitherT.right(ClockAlg[F].getRequestDate())

      newUser <- EitherT.fromEither[F](user.changeLastRes(requestDate))

      id <- EitherT.right(
        ObjectIdGeneratorAlg[F].generateObjectId()
      )

      hash <- EitherT.right(topic.hash[F](newUser))

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
      newTopic <- EitherT.fromEither[F](topic.resUpdate(result, result.age))
    } yield (result, newUser, newTopic)
  }

  implicit class ResNormalService[ReplyResId: ResId, TopicIdType](
      val self: ResNormal[ReplyResId, TopicIdType]
  ) {
    def del(
        resUser: User,
        authToken: AuthToken
    ): Either[AtError, (ResNormal[ReplyResId, TopicIdType], User)] = {
      assert(resUser.id === authToken.user);
      for {
        _ <- Either.cond(
          authToken.user === self.user,
          (),
          new AtRightError("人の書き込み削除は出来ません")
        )

        _ <- Either.cond(
          self.deleteFlag.isEmpty,
          (),
          new AtPrerequisiteError("既に削除済みです")
        )

        val newResUser = resUser.changeLv(resUser.lv - 1)
      } yield (
        (
          self.copy(
            deleteFlag = Some(ResDeleteReason.Self())
          ),
          newResUser
        )
      )
    }
  }
}
