package com.anontown.entities.user;

import java.time.OffsetDateTime;
import com.anontown.utils.Impl._;
import com.anontown.Constant
import com.anontown.AtError
import com.anontown.AuthUser
import com.anontown.AtUserAuthError
import com.anontown.AtPrerequisiteError
import cats._, cats.implicits._, cats.derived._
import com.anontown.ports.ObjectIdGeneratorComponent
import com.anontown.ports.ClockComponent
import com.anontown.ports.ConfigContainerComponent
import zio.ZIO
import com.anontown.utils.OffsetDateTimeUtils._

final case class UserAPI(id: String, sn: String);

object UserAPI {
  implicit val eqImpl: Eq[UserAPI] = {
    import auto.eq._
    semi.eq
  }
}

final case class User(
    id: UserId,
    sn: UserSn,
    pass: UserEncryptedPass,
    lv: Int,
    resWait: ResWait,
    lastTopic: OffsetDateTime,
    date: OffsetDateTime,
    // 毎日リセットされ、特殊動作をすると増えるポイント
    point: Int,
    lastOneTopic: OffsetDateTime
) {
  def toAPI(): UserAPI = {
    UserAPI(id = this.id.value, sn = this.sn.value);
  }

  def change(
      authUser: AuthUser,
      pass: Option[String],
      sn: Option[String]
  )(ports: ConfigContainerComponent): Either[AtError, User] = {
    require(authUser.id === this.id);

    (
      pass
        .map(
          UserRawPass.fromString(_).map(UserEncryptedPass.fromRawPass(_)(ports))
        )
        .getOrElse(Right(this.pass))
        .toValidated,
      sn.map(
          UserSn.fromString(_)
        )
        .getOrElse(Right(this.sn))
        .toValidated
    ).mapN(
        (pass, sn) =>
          this.copy(
            sn = sn,
            pass = pass
          )
      )
      .toEither;
  }

  def auth(pass: String)(
      ports: ConfigContainerComponent
  ): Either[AtError, AuthUser] = {
    if (this.pass.validation(pass)(ports)) {
      Right(AuthUser(id = this.id))
    } else {
      Left(AtUserAuthError())
    }
  }

  def usePoint(value: Int): Either[AtError, User] = {
    if (this.lv < this.point + value) {
      Left(AtPrerequisiteError("LVが足りません"))
    } else {
      Right(this.copy(point = this.point + value));
    }
  }

  def changeLv(lv: Int): User = {
    this.copy(
      lv =
        if (lv < 1) 1
        else (if (lv > Constant.User.lvMax) Constant.User.lvMax
              else lv)
    );
  }

  def changeLastRes(lastRes: OffsetDateTime): Either[AtError, User] = {
    // 条件
    // 係数
    // Constant.user.lvMaxの時、Constant.res.wait.maxLv倍緩和
    val coe =
      (this.lv.toDouble / Constant.User.lvMax.toDouble) * (Constant.Res.Wait.maxLv.toDouble - 1) + 1;
    if (this.resWait.count.d1.toDouble < Constant.Res.Wait.d1.toDouble * coe &&
        this.resWait.count.h12.toDouble < Constant.Res.Wait.h12.toDouble * coe &&
        this.resWait.count.h6.toDouble < Constant.Res.Wait.h6.toDouble * coe &&
        this.resWait.count.h1.toDouble < Constant.Res.Wait.h1.toDouble * coe &&
        this.resWait.count.m30.toDouble < Constant.Res.Wait.m30.toDouble * coe &&
        this.resWait.count.m10.toDouble < Constant.Res.Wait.m10.toDouble * coe &&
        this.resWait.last.toEpochMilli + 1000 * Constant.Res.Wait.minSecond <
          lastRes.toEpochMilli) {
      Right(
        this.copy(
          resWait = ResWait(
            last = lastRes,
            count = ResWaitCount(
              d1 = this.resWait.count.d1 + 1,
              h12 = this.resWait.count.h12 + 1,
              h6 = this.resWait.count.h6 + 1,
              h1 = this.resWait.count.h1 + 1,
              m30 = this.resWait.count.m30 + 1,
              m10 = this.resWait.count.m10 + 1
            )
          )
        )
      );
    } else {
      Left(AtPrerequisiteError("連続書き込みはできません"));
    }
  }

  def changeLastTopic(lastTopic: OffsetDateTime): Either[AtError, User] = {
    if (this.lastTopic.toEpochMilli + 1000 * 60 * 30 < lastTopic.toEpochMilli) {
      Right(this.copy(lastTopic = lastTopic));
    } else {
      Left(AtPrerequisiteError("連続書き込みはできません"));
    }
  }

  def changeLastOneTopic(lastTopic: OffsetDateTime): Either[AtError, User] = {
    if (this.lastOneTopic.toEpochMilli + 1000 * 60 * 10 < lastTopic.toEpochMilli) {
      Right(this.copy(lastOneTopic = lastTopic));
    } else {
      Left(AtPrerequisiteError("連続書き込みはできません"));
    }
  }
}

object User {
  implicit val eqImpl: Eq[User] = {
    import auto.eq._
    semi.eq
  }

  def create(
      sn: String,
      pass: String
  ): ZIO[
    ObjectIdGeneratorComponent with ClockComponent with ConfigContainerComponent,
    AtError,
    User
  ] = {
    for {
      (sn, pass) <- ZIO.fromEither(
        (
          UserSn.fromString(sn).toValidated,
          UserRawPass.fromString(pass).toValidated
        ).mapN((_, _)).toEither
      )

      date <- ZIO.access[
        ClockComponent
      ](_.clock.requestDate)

      id <- ZIO.accessM[ObjectIdGeneratorComponent](
        _.objectIdGenerator.generateObjectId()
      )

      pass <- ZIO.fromFunction(UserEncryptedPass.fromRawPass(pass))
    } yield User(
      id = UserId(id),
      sn = sn,
      pass = pass,
      lv = 1,
      resWait = ResWait(
        last = date,
        count = ResWaitCount(m10 = 0, m30 = 0, h1 = 0, h6 = 0, h12 = 0, d1 = 0)
      ),
      lastTopic = date,
      date = date,
      point = 0,
      lastOneTopic = date
    )
  }
}
