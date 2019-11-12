package com.anontown.entities;

import org.scalatest._
import org.mongodb.scala.bson.ObjectId
import java.time.OffsetDateTime
import java.time.Instant
import java.time.ZoneOffset
import com.anontown.ports.ObjectIdGenerator
import com.anontown.ports.Clock
import com.anontown.ports.ObjectIdGeneratorComponent
import com.anontown.ports.ClockComponent
import com.anontown.adapters.ClockImpl
import com.anontown.ports.ConfigContainerComponent
import com.anontown.adapters.ConfigContainerImpl
import com.anontown.ConfigFixtures
import com.anontown.adapters.DummyObjectIdGenerator
import com.anontown.adapters.DummyConfigContainerImpl
import com.anontown.ports.ConfigContainer
import com.anontown.TestHelper
import zio.ZIO
import com.anontown.utils.ZIOUtils._

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
    resWait =
      ResWait(
        last =
          OffsetDateTime.ofInstant(Instant.ofEpochMilli(300), ZoneOffset.UTC),
        count = ResWaitCount(
          m10 = 0,
          m30 = 0,
          h1 = 0,
          h6 = 0,
          h12 = 0,
          d1 = 0
        )
      ),
    lastTopic =
      OffsetDateTime.ofInstant(Instant.ofEpochMilli(100), ZoneOffset.UTC),
    date = OffsetDateTime.ofInstant(Instant.ofEpochMilli(0), ZoneOffset.UTC),
    point = 0,
    lastOneTopic =
      OffsetDateTime.ofInstant(Instant.ofEpochMilli(150), ZoneOffset.UTC)
  )
}

class UserSpec extends FlatSpec with Matchers {
  def createPorts() =
    new ObjectIdGeneratorComponent with ClockComponent
    with ConfigContainerComponent {
      val objectIdGenerator =
        new DummyObjectIdGenerator(UserFixtures.userID)

      val clock = new ClockImpl(
        OffsetDateTime.ofInstant(Instant.ofEpochMilli(0), ZoneOffset.UTC)
      )

      val configContainer = new DummyConfigContainerImpl()
    }

  "create" should "正常に作れるか" in {
    TestHelper.runZioTest(createPorts()) {
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
              last = OffsetDateTime
                .ofInstant(Instant.ofEpochMilli(0), ZoneOffset.UTC)
            ),
            lastTopic =
              OffsetDateTime.ofInstant(Instant.ofEpochMilli(0), ZoneOffset.UTC),
            lastOneTopic =
              OffsetDateTime.ofInstant(Instant.ofEpochMilli(0), ZoneOffset.UTC)
          )
        );
      })
    }
  }

  it should "パスワードが不正な時エラーになるか" in {
    TestHelper.runZioTest(createPorts()) {
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

  it should "スクリーンネームが不正な時エラーになるか" in {
    TestHelper.runZioTest(createPorts()) {
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

  "toAPI" should "正常に変換出来るか" in {
    UserFixtures.user.toAPI() should be(
      UserAPI(id = UserFixtures.userID, sn = "scn")
    )
  }

}
