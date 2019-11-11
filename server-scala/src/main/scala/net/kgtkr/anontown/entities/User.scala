package net.kgtkr.anontown.entities;

import java.time.OffsetDateTime;
import net.kgtkr.anontown.ports.ObjectIdGenerator
import net.kgtkr.anontown.ports.Clock
import net.kgtkr.anontown.utils;
import net.kgtkr.anontown.utils.Impl._;
import net.kgtkr.anontown.Config
import net.kgtkr.anontown.Constant
import net.kgtkr.anontown.AtError
import net.kgtkr.anontown.AtParamsError
import net.kgtkr.anontown.AuthUser
import cats.data.Validated
import net.kgtkr.anontown.AtUserAuthError
import net.kgtkr.anontown.AtPrerequisiteError
import cats._, cats.implicits._, cats.derived._

final case class UserAPI(id: String, sn: String);

object UserAPI {
  implicit val eqImpl: Eq[UserAPI] = {
    import auto.eq._
    semi.eq
  }

  implicit val showImpl: Show[UserAPI] = {
    import auto.show._
    semi.show
  }
}

final case class ResWaitCount(
    m10: Int,
    m30: Int,
    h1: Int,
    h6: Int,
    h12: Int,
    d1: Int
);

object ResWaitCount {
  implicit val eqImpl: Eq[ResWaitCount] = {
    import auto.eq._
    semi.eq
  }

  implicit val showImpl: Show[ResWaitCount] = {
    import auto.show._
    semi.show
  }
}

final case class ResWait(last: OffsetDateTime, count: ResWaitCount)

object ResWait {
  implicit val eqImpl: Eq[ResWait] = {
    import auto.eq._
    semi.eq
  }

  implicit val showImpl: Show[ResWait] = {
    import auto.show._
    semi.show
  }
}

final case class User(
    id: String,
    sn: String,
    pass: String,
    lv: Int,
    resWait: ResWait,
    lastTopic: OffsetDateTime,
    date: OffsetDateTime,
    // 毎日リセットされ、特殊動作をすると増えるポイント
    point: Int,
    lastOneTopic: OffsetDateTime
) {
  def toAPI(): UserAPI = {
    UserAPI(id = this.id, sn = this.sn);
  }

  def change(
      authUser: AuthUser,
      pass: Option[String],
      sn: Option[String]
  ): Either[AtError, User] = {
    require(authUser.id === this.id);

    (
      pass
        .map(Constant.User.passRegex.apValidate("pass", _))
        .getOrElse(Validated.Valid(())),
      sn.map(
          Constant.User.snRegex
            .apValidate("sn", _)
        )
        .getOrElse(Validated.Valid(()))
    ).mapN(
        (_, _) =>
          this.copy(
            pass = pass
              .map(User.hash(_))
              .getOrElse(this.pass),
            sn = sn.getOrElse(this.sn)
          )
      )
      .toEither
      .leftMap(AtParamsError);
  }

  def auth(pass: String): Either[AtError, AuthUser] = {
    if (this.pass === User.hash(pass)) {
      Right(AuthUser(id = this.id, pass = this.pass))
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
        this.resWait.last.toEpochSecond() + Constant.Res.Wait.minSecond <
          lastRes.toEpochSecond()) {
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
    if (this.lastTopic.toEpochSecond + 60 * 30 < lastTopic.toEpochSecond) {
      Right(this.copy(lastTopic = lastTopic));
    } else {
      Left(AtPrerequisiteError("連続書き込みはできません"));
    }
  }

  def changeLastOneTopic(lastTopic: OffsetDateTime): Either[AtError, User] = {
    if (this.lastOneTopic.toEpochSecond + 60 * 10 < lastTopic.toEpochSecond) {
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

  implicit val showImpl: Show[User] = {
    import auto.show._
    semi.show
  }

  def create(
      sn: String,
      pass: String,
      ports: ObjectIdGenerator with Clock
  ): Either[AtError, User] = {
    (
      Constant.User.passRegex.apValidate("pass", pass),
      Constant.User.snRegex
        .apValidate("sn", sn)
    ).mapN(
        (_, _) =>
          User(
            id = ports.generateObjectId(),
            sn = sn,
            pass = User.hash(pass),
            lv = 1,
            resWait = ResWait(
              last = ports.now(),
              count =
                ResWaitCount(m10 = 0, m30 = 0, h1 = 0, h6 = 0, h12 = 0, d1 = 0)
            ),
            lastTopic = ports.now(),
            date = ports.now(),
            point = 0,
            lastOneTopic = ports.now()
          )
      )
      .toEither
      .leftMap(AtParamsError);
  }

  def hash(pass: String): String = {
    utils.hash(pass + Config.config.salt.pass)
  }
}
