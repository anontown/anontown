package com.anontown.entities;

import org.scalatest._
import org.mongodb.scala.bson.ObjectId
import java.time.OffsetDateTime
import java.time.ZoneOffset
import com.anontown.services.ObjectIdGenerator
import com.anontown.services.Clock
import com.anontown.services.ObjectIdGeneratorComponent
import com.anontown.services.ClockComponent
import com.anontown.adapters.ClockImpl
import com.anontown.services.ConfigContainerComponent
import com.anontown.adapters.ConfigContainerImpl
import com.anontown.ConfigFixtures
import com.anontown.adapters.DummyObjectIdGeneratorImpl
import com.anontown.adapters.DummyConfigContainerImpl
import com.anontown.services.ConfigContainer
import com.anontown.TestHelper
import zio.ZIO
import com.anontown.utils.ZIOUtils._
import com.anontown.utils.OffsetDateTimeUtils
import com.anontown.AuthUser

object UserFixtures {
  val userID = new ObjectId().toHexString()
  val user = User(
    id = UserId(userID),
    sn = UserSn("scn"),
    pass = UserEncryptedPass.fromRawPass(UserRawPass("pass"))(
      new ConfigContainerComponent {
        val configContainer = new DummyConfigContainerImpl()
      }
    ),
    lv = 1,
    resWait = ResWait(
      last = OffsetDateTimeUtils.ofEpochMilli(300),
      count = ResWaitCount(
        m10 = 0,
        m30 = 0,
        h1 = 0,
        h6 = 0,
        h12 = 0,
        d1 = 0
      )
    ),
    lastTopic = OffsetDateTimeUtils.ofEpochMilli(100),
    date = OffsetDateTimeUtils.ofEpochMilli(0),
    point = 0,
    lastOneTopic = OffsetDateTimeUtils.ofEpochMilli(150)
  )
}

class UserSpec extends FunSpec with Matchers {
  describe("create") {
    it("正常に作れるか") {
      TestHelper.runZio(
        TestHelper.createPorts(objectIdIt = Iterator(UserFixtures.userID))
      ) {
        (for {
          user <- User
            .create(
              sn = "scn",
              pass = "pass"
            )
        } yield {
          user should be(
            UserFixtures.user.copy(
              resWait = UserFixtures.user.resWait.copy(
                last = OffsetDateTimeUtils.ofEpochMilli(0)
              ),
              lastTopic = OffsetDateTimeUtils.ofEpochMilli(0),
              lastOneTopic = OffsetDateTimeUtils.ofEpochMilli(0)
            )
          );
        })
      }
    }

    it("パスワードが不正な時エラーになるか") {
      TestHelper.runZio(TestHelper.createPorts()) {
        (for {
          result1 <- User
            .create(
              sn = "scn",
              pass = "x"
            )
            .toEither
          result2 <- User
            .create(
              sn = "scn",
              pass = "x".repeat(51)
            )
            .toEither

          result3 <- User
            .create(
              sn = "scn",
              pass = "あ"
            )
            .toEither
        } yield {
          assert(result1.isLeft)
          assert(result2.isLeft)
          assert(result3.isLeft)
        })
      }
    }

    it("スクリーンネームが不正な時エラーになるか") {
      TestHelper.runZio(TestHelper.createPorts()) {
        (for {
          result1 <- User
            .create(
              sn = "x",
              pass = "pass"
            )
            .toEither
          result2 <- User
            .create(
              sn = "x".repeat(21),
              pass = "pass"
            )
            .toEither

          result3 <- User
            .create(
              sn = "あ",
              pass = "pass"
            )
            .toEither
        } yield {
          assert(result1.isLeft)
          assert(result2.isLeft)
          assert(result3.isLeft)
        })
      }
    }
  }

  describe("toAPI") {
    it("正常に変換出来るか") {
      UserFixtures.user.toAPI() should be(
        UserAPI(id = UserFixtures.userID, sn = "scn")
      )
    }
  }

  describe("change") {
    val authUser = AuthUser(
      id = UserId(UserFixtures.userID)
    )

    it("正常に変更出来るか") {
      UserFixtures.user.change(authUser, pass = None, sn = Some("scn2"))(
        TestHelper.createPorts()
      ) should be(
        Right(
          UserFixtures.user.copy(
            sn = UserSn("scn2"),
            pass = UserEncryptedPass.fromRawPass(UserRawPass("pass"))(
              TestHelper.createPorts()
            )
          )
        )
      )

      UserFixtures.user.change(authUser, pass = Some("pass2"), sn = None)(
        TestHelper.createPorts()
      ) should be(
        Right(
          UserFixtures.user.copy(
            sn = UserSn("scn"),
            pass = UserEncryptedPass.fromRawPass(UserRawPass("pass2"))(
              TestHelper.createPorts()
            )
          )
        )
      )
    }

    it("パスワードが不正な時エラーになるか") {
      assert(
        UserFixtures.user
          .change(authUser, pass = Some("x"), sn = Some("scn"))(
            TestHelper.createPorts()
          )
          .isLeft
      )

      assert(
        UserFixtures.user
          .change(authUser, pass = Some("x".repeat(51)), sn = Some("scn"))(
            TestHelper.createPorts()
          )
          .isLeft
      )

      assert(
        UserFixtures.user
          .change(authUser, pass = Some("あ"), sn = Some("scn"))(
            TestHelper.createPorts()
          )
          .isLeft
      )
    }

    it("スクリーンネームが不正な時エラーになるか") {
      assert(
        UserFixtures.user
          .change(authUser, pass = Some("pass"), sn = Some("x"))(
            TestHelper.createPorts()
          )
          .isLeft
      )

      assert(
        UserFixtures.user
          .change(authUser, pass = Some("pass"), sn = Some("x".repeat(21)))(
            TestHelper.createPorts()
          )
          .isLeft
      )

      assert(
        UserFixtures.user
          .change(authUser, pass = Some("pass"), sn = Some("あ"))(
            TestHelper.createPorts()
          )
          .isLeft
      )
    }
  }

  describe("auth") {
    it("正常に認証出来るか") {
      UserFixtures.user
        .auth("pass")(
          TestHelper.createPorts()
        ) should be(
        Right(
          AuthUser(
            id = UserId(UserFixtures.userID)
          )
        )
      )
    }

    it("パスワードが違う時エラーになるか") {
      assert(
        UserFixtures.user
          .auth("pass2")(
            TestHelper.createPorts()
          )
          .isLeft
      )
    }
  }

  describe("usePoint") {
    it("正常に使えるか") {
      UserFixtures.user.usePoint(1) should be(
        Right(UserFixtures.user.copy(point = 1))
      )

      UserFixtures.user.copy(lv = 5, point = 3).usePoint(1) should be(
        Right(UserFixtures.user.copy(lv = 5, point = 4))
      )
    }

    it("レベル以上のポイントを使おうとするとエラーになるか") {
      assert(
        UserFixtures.user.usePoint(2).isLeft
      )
    }

    it("ポイントが足りない時エラーになるか") {
      assert(
        UserFixtures.user.copy(lv = 5, point = 3).usePoint(3).isLeft
      )
    }
  }

  describe("changeLv") {
    it("正常に変更出来るか") {
      UserFixtures.user.changeLv(5) should be(
        UserFixtures.user.copy(lv = 5)
      )
    }

    it("1未満になるとき") {
      UserFixtures.user.changeLv(-10) should be(
        UserFixtures.user.copy(lv = 1)
      )
    }

    it("1000超過になるとき") {
      UserFixtures.user.changeLv(2000) should be(
        UserFixtures.user.copy(lv = 1000)
      )
    }
  }

  describe("changeLastRes") {
    it("正常に変更出来るか") {
      UserFixtures.user
        .copy(
          resWait = ResWait(
            last = OffsetDateTimeUtils.ofEpochMilli(0),
            count = ResWaitCount(
              m10 = 4,
              m30 = 9,
              h1 = 14,
              h6 = 19,
              h12 = 34,
              d1 = 49
            )
          )
        )
        .changeLastRes(OffsetDateTimeUtils.ofEpochMilli(60 * 1000)) should be(
        Right(
          UserFixtures.user
            .copy(
              resWait = ResWait(
                last = OffsetDateTimeUtils.ofEpochMilli(60 * 1000),
                count = ResWaitCount(
                  m10 = 5,
                  m30 = 10,
                  h1 = 15,
                  h6 = 20,
                  h12 = 35,
                  d1 = 50
                )
              )
            )
        )
      )
    }

    it("すぐに投稿するとエラーになるか") {
      assert(
        UserFixtures.user
          .changeLastRes(OffsetDateTimeUtils.ofEpochMilli(10))
          .isLeft
      )
    }

    describe("投稿数が多いとエラーになるか") {
      it("m10") {
        assert(
          UserFixtures.user
            .copy(
              resWait = ResWait(
                last = OffsetDateTimeUtils.ofEpochMilli(0),
                count = ResWaitCount(
                  m10 = 10000,
                  m30 = 10000,
                  h1 = 10000,
                  h6 = 10000,
                  h12 = 10000,
                  d1 = 10000
                )
              )
            )
            .changeLastRes(OffsetDateTimeUtils.ofEpochMilli(30 * 1000))
            .isLeft
        )
      }

      it("m30") {
        assert(
          UserFixtures.user
            .copy(
              resWait = ResWait(
                last = OffsetDateTimeUtils.ofEpochMilli(0),
                count = ResWaitCount(
                  m10 = 0,
                  m30 = 10000,
                  h1 = 10000,
                  h6 = 10000,
                  h12 = 10000,
                  d1 = 10000
                )
              )
            )
            .changeLastRes(OffsetDateTimeUtils.ofEpochMilli(30 * 1000))
            .isLeft
        )
      }

      it("h1") {
        assert(
          UserFixtures.user
            .copy(
              resWait = ResWait(
                last = OffsetDateTimeUtils.ofEpochMilli(0),
                count = ResWaitCount(
                  m10 = 0,
                  m30 = 0,
                  h1 = 10000,
                  h6 = 10000,
                  h12 = 10000,
                  d1 = 10000
                )
              )
            )
            .changeLastRes(OffsetDateTimeUtils.ofEpochMilli(30 * 1000))
            .isLeft
        )
      }

      it("h6") {
        assert(
          UserFixtures.user
            .copy(
              resWait = ResWait(
                last = OffsetDateTimeUtils.ofEpochMilli(0),
                count = ResWaitCount(
                  m10 = 0,
                  m30 = 0,
                  h1 = 0,
                  h6 = 10000,
                  h12 = 10000,
                  d1 = 10000
                )
              )
            )
            .changeLastRes(OffsetDateTimeUtils.ofEpochMilli(30 * 1000))
            .isLeft
        )
      }

      it("h12") {
        assert(
          UserFixtures.user
            .copy(
              resWait = ResWait(
                last = OffsetDateTimeUtils.ofEpochMilli(0),
                count = ResWaitCount(
                  m10 = 0,
                  m30 = 0,
                  h1 = 0,
                  h6 = 0,
                  h12 = 10000,
                  d1 = 10000
                )
              )
            )
            .changeLastRes(OffsetDateTimeUtils.ofEpochMilli(30 * 1000))
            .isLeft
        )
      }

      it("d1") {
        assert(
          UserFixtures.user
            .copy(
              resWait = ResWait(
                last = OffsetDateTimeUtils.ofEpochMilli(0),
                count = ResWaitCount(
                  m10 = 0,
                  m30 = 0,
                  h1 = 0,
                  h6 = 0,
                  h12 = 0,
                  d1 = 10000
                )
              )
            )
            .changeLastRes(OffsetDateTimeUtils.ofEpochMilli(30 * 1000))
            .isLeft
        )
      }
    }

    describe("changeLastTopic") {
      it("正常に変更出来るか") {
        UserFixtures.user
          .changeLastTopic(OffsetDateTimeUtils.ofEpochMilli(100000000)) should be(
          Right(
            UserFixtures.user
              .copy(
                lastTopic = OffsetDateTimeUtils.ofEpochMilli(100000000)
              )
          )
        )
      }

      it("間隔が短いとエラーになるか") {
        assert(
          UserFixtures.user
            .changeLastTopic(OffsetDateTimeUtils.ofEpochMilli(10000))
            .isLeft
        )
      }
    }

    describe("changeLastOneTopic") {
      it("正常に変更出来るか") {
        UserFixtures.user
          .changeLastOneTopic(OffsetDateTimeUtils.ofEpochMilli(100000000)) should be(
          Right(
            UserFixtures.user
              .copy(
                lastOneTopic = OffsetDateTimeUtils.ofEpochMilli(100000000)
              )
          )
        )
      }

      it("間隔が短いとエラーになるか") {
        assert(
          UserFixtures.user
            .changeLastOneTopic(OffsetDateTimeUtils.ofEpochMilli(10000))
            .isLeft
        )
      }
    }
  }
}
