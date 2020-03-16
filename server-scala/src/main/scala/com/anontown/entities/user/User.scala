package com.anontown.entities.user;

import com.anontown.AtError
import com.anontown.AuthUser
import com.anontown.AtUserAuthError
import com.anontown.AtPrerequisiteError
import cats._, cats.implicits._, cats.derived._
import com.anontown.ports.ObjectIdGeneratorAlg
import com.anontown.ports.ClockAlg
import com.anontown.ports.ConfigContainerAlg
import cats.data.EitherT
import com.anontown.entities.DateTime
import com.anontown.entities.Interval

final case class UserAPI(id: String, sn: String);

object UserAPI {
  implicit val implEq: Eq[UserAPI] = {
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
    lastTopic: DateTime,
    date: DateTime,
    // 毎日リセットされ、特殊動作をすると増えるポイント
    point: Int,
    lastOneTopic: DateTime
);

object User {
  object Wait {
    val maxLv: Int = 3;
    val minSecond: Int = 7;
    val m10: Int = 10;
    val m30: Int = 15;
    val h1: Int = 20;
    val h6: Int = 30;
    val h12: Int = 40;
    val d1: Int = 50;
  }

  implicit val implEq: Eq[User] = {
    import auto.eq._
    semi.eq
  }

  def create[F[_]: Monad: ObjectIdGeneratorAlg: ClockAlg: ConfigContainerAlg](
      sn: String,
      pass: String
  ): EitherT[
    F,
    AtError,
    User
  ] = {
    for {
      (sn, pass) <- EitherT.fromEither[F](
        (
          UserSn.fromString(sn).toValidated,
          UserRawPass.fromString(pass).toValidated
        ).mapN((_, _)).toEither
      )

      requestDate <- EitherT.right(ClockAlg[F].getRequestDate())

      id <- EitherT.right(ObjectIdGeneratorAlg[F].generateObjectId())

      pass <- EitherT.right(UserEncryptedPass.fromRawPass[F](pass))
    } yield User(
      id = UserId(id),
      sn = sn,
      pass = pass,
      lv = 1,
      resWait = ResWait(
        last = requestDate,
        count = ResWaitCount(m10 = 0, m30 = 0, h1 = 0, h6 = 0, h12 = 0, d1 = 0)
      ),
      lastTopic = requestDate,
      date = requestDate,
      point = 0,
      lastOneTopic = requestDate
    )
  }

  implicit class UserService(val self: User) {
    val lvMax: Int = 1000;

    def toAPI(): UserAPI = {
      UserAPI(id = self.id.value, sn = self.sn.value);
    }

    def change[F[_]: Monad: ConfigContainerAlg](
        authUser: AuthUser,
        pass: Option[String],
        sn: Option[String]
    ): EitherT[F, AtError, User] = {
      require(authUser.id === self.id);

      for {
        encryptedPass <- EitherT.right(
          pass
            .map(
              UserRawPass
                .fromString(_)
                .map(UserEncryptedPass.fromRawPass[F](_))
                .sequence
            )
            .sequence
        )

        result <- EitherT.fromEither[F](
          ((
            encryptedPass
              .getOrElse(Right(self.pass))
              .toValidated,
            sn.map(
                UserSn.fromString(_)
              )
              .getOrElse(Right(self.sn))
              .toValidated
          ).mapN(
              (pass, sn) =>
                self.copy(
                  sn = sn,
                  pass = pass
                )
            )
            .toEither)
            .leftWiden[AtError]
        )
      } yield result
    }

    def auth[F[_]: Monad: ConfigContainerAlg](
        pass: String
    ): EitherT[F, AtError, AuthUser] = {
      EitherT
        .right(
          self.pass
            .validation[F](pass)
        )
        .flatMap(
          isValid =>
            if (isValid) {
              EitherT.rightT(AuthUser(id = self.id))
            } else {
              EitherT.leftT(AtUserAuthError())
            }
        )
    }

    def usePoint(value: Int): Either[AtError, User] = {
      if (self.lv < self.point + value) {
        Left(AtPrerequisiteError("LVが足りません"))
      } else {
        Right(self.copy(point = self.point + value));
      }
    }

    def changeLv(lv: Int): User = {
      self.copy(
        lv =
          if (lv < 1) 1
          else (if (lv > lvMax) lvMax
                else lv)
      );
    }

    def changeLastRes[F[_]: Monad: ClockAlg](): EitherT[F, AtError, User] = {
      for {
        requestDate <- EitherT.right(ClockAlg[F].getRequestDate())
        // 条件
        // 係数
        // lvMaxの時、Constant.res.wait.maxLv倍緩和
        val coe = (self.lv.toDouble / lvMax.toDouble) * (Wait.maxLv.toDouble - 1) + 1;
        result <- EitherT.cond[F](
          self.resWait.count.d1.toDouble < Wait.d1.toDouble * coe &&
            self.resWait.count.h12.toDouble < Wait.h12.toDouble * coe &&
            self.resWait.count.h6.toDouble < Wait.h6.toDouble * coe &&
            self.resWait.count.h1.toDouble < Wait.h1.toDouble * coe &&
            self.resWait.count.m30.toDouble < Wait.m30.toDouble * coe &&
            self.resWait.count.m10.toDouble < Wait.m10.toDouble * coe &&
            self.resWait.last + Interval.fromSeconds(Wait.minSecond) <
              requestDate,
          self.copy(
            resWait = ResWait(
              last = requestDate,
              count = ResWaitCount(
                d1 = self.resWait.count.d1 + 1,
                h12 = self.resWait.count.h12 + 1,
                h6 = self.resWait.count.h6 + 1,
                h1 = self.resWait.count.h1 + 1,
                m30 = self.resWait.count.m30 + 1,
                m10 = self.resWait.count.m10 + 1
              )
            )
          ),
          AtPrerequisiteError("連続書き込みはできません"): AtError
        )
      } yield result
    }

    def changeLastTopic[F[_]: Monad: ClockAlg](): EitherT[F, AtError, User] = {
      for {
        requestDate <- EitherT.right(ClockAlg[F].getRequestDate())
        result <- EitherT.cond[F](
          self.lastTopic + Interval.fromMinutes(30) < requestDate,
          self.copy(lastTopic = requestDate),
          AtPrerequisiteError("連続書き込みはできません"): AtError
        )
      } yield result
    }

    def changeLastOneTopic[F[_]: Monad: ClockAlg]()
        : EitherT[F, AtError, User] = {
      for {
        requestDate <- EitherT.right(ClockAlg[F].getRequestDate())
        result <- EitherT.cond[F](
          self.lastOneTopic + Interval.fromMinutes(10) < requestDate,
          self.copy(lastOneTopic = requestDate),
          AtPrerequisiteError("連続書き込みはできません"): AtError
        )
      } yield result
    }
  }
}
