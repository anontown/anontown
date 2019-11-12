package net.kgtkr.anontown.entities;

import org.scalatest._
import org.mongodb.scala.bson.ObjectId
import java.time.OffsetDateTime
import java.time.Instant
import java.time.ZoneOffset
import net.kgtkr.anontown.ports.ObjectIdGenerator
import net.kgtkr.anontown.ports.Clock
import net.kgtkr.anontown.ports.ObjectIdGeneratorComponent
import net.kgtkr.anontown.ports.ClockComponent
import net.kgtkr.anontown.adapters.ClockImpl
import net.kgtkr.anontown.ports.ConfigContainerComponent
import net.kgtkr.anontown.adapters.ConfigContainerImpl
import net.kgtkr.anontown.ConfigFixtures
import net.kgtkr.anontown.adapters.DummyObjectIdGenerator
import net.kgtkr.anontown.adapters.DummyConfigContainerImpl
import net.kgtkr.anontown.ports.ConfigContainer
import net.kgtkr.anontown.TestHelper

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
}
