package net.kgtkr.anontown.entities;

import java.time.OffsetDateTime;
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
import net.kgtkr.anontown.AtParamsErrorItem
import scala.util.chaining._
import net.kgtkr.anontown.ports.ObjectIdGeneratorComponent
import net.kgtkr.anontown.ports.ClockComponent
import net.kgtkr.anontown.ports.ConfigContainerComponent

final case class UserId(value: String) extends AnyVal;
object UserId {
  implicit val eqImpl: Eq[UserId] = {
    import auto.eq._
    semi.eq
  }

  implicit val showImpl: Show[UserId] = {
    import auto.show._
    semi.show
  }
}

final case class UserSn(value: String) extends AnyVal;
object UserSn {
  implicit val eqImpl: Eq[UserSn] = {
    import auto.eq._
    semi.eq
  }

  implicit val showImpl: Show[UserSn] = {
    import auto.show._
    semi.show
  }

  def fromString(
      value: String
  ): Either[AtParamsError, UserSn] = {
    Constant.User.snRegex.apValidate("sn", value).map(UserSn(_))
  }
}

final case class UserRawPass(value: String) extends AnyVal;
object UserRawPass {
  implicit val eqImpl: Eq[UserRawPass] = {
    import auto.eq._
    semi.eq
  }

  implicit val showImpl: Show[UserRawPass] = {
    import auto.show._
    semi.show
  }

  def fromString(
      value: String
  ): Either[AtParamsError, UserRawPass] = {
    Constant.User.passRegex.apValidate("pass", value).map(UserRawPass(_))
  }
}

final case class UserEncryptedPass(value: String) extends AnyVal {
  def validation(pass: String, ports: ConfigContainerComponent): Boolean = {
    this.value === UserEncryptedPass.hash(pass, ports)
  }
}

object UserEncryptedPass {
  implicit val eqImpl: Eq[UserEncryptedPass] = {
    import auto.eq._
    semi.eq
  }

  implicit val showImpl: Show[UserEncryptedPass] = {
    import auto.show._
    semi.show
  }

  def fromRawPass(
      pass: UserRawPass,
      ports: ConfigContainerComponent
  ): UserEncryptedPass = {
    UserEncryptedPass(UserEncryptedPass.hash(pass.value, ports))
  }

  private def hash(pass: String, ports: ConfigContainerComponent): String = {
    utils.hash(pass + ports.configContainer.config.salt.pass)
  }
}

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
      sn: Option[String],
      ports: ConfigContainerComponent
  ): Either[AtError, User] = {
    require(authUser.id === this.id);

    (
      pass
        .map(
          UserRawPass.fromString(_).map(UserEncryptedPass.fromRawPass(_, ports))
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

  def auth(
      pass: String,
      ports: ConfigContainerComponent
  ): Either[AtError, AuthUser] = {
    if (this.pass.validation(pass, ports)) {
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
      ports: ObjectIdGeneratorComponent
        with ClockComponent
        with ConfigContainerComponent
  ): Either[AtError, User] = {
    (
      UserSn.fromString(sn).toValidated,
      UserRawPass.fromString(pass).toValidated
    ).mapN(
        (sn, pass) =>
          User(
            id = UserId(ports.objectIdGenerator.generateObjectId()),
            sn = sn,
            pass = UserEncryptedPass.fromRawPass(pass, ports),
            lv = 1,
            resWait = ResWait(
              last = ports.clock.now(),
              count =
                ResWaitCount(m10 = 0, m30 = 0, h1 = 0, h6 = 0, h12 = 0, d1 = 0)
            ),
            lastTopic = ports.clock.now(),
            date = ports.clock.now(),
            point = 0,
            lastOneTopic = ports.clock.now()
          )
      )
      .toEither;
  }
}
