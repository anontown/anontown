package net.kgtkr.anontown.entities;

import org.scalatest._
import org.mongodb.scala.bson.ObjectId
import java.time.OffsetDateTime
import java.time.Instant
import java.time.ZoneOffset
import net.kgtkr.anontown.ports.ObjectIdGenerator
import net.kgtkr.anontown.ports.Clock

class UserSpec extends FlatSpec with Matchers {
  val userID = new ObjectId().toHexString()
  val user = User(
    id = UserId(userID),
    sn = UserSn("scn"),
    pass = UserEncryptedPass.fromRawPass(UserRawPass("pass")),
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
  "create" should "正常に作れるか" in {
    (User.create(
      sn = "scn",
      pass = "pass",
      ports = new ObjectIdGenerator with Clock {
        def generateObjectId() = userID;
        def now() =
          OffsetDateTime.ofInstant(Instant.ofEpochMilli(0), ZoneOffset.UTC);
      }
    ) should be(
      user.copy(
        resWait = user.resWait.copy(
          last =
            OffsetDateTime.ofInstant(Instant.ofEpochMilli(0), ZoneOffset.UTC)
        ),
        lastTopic =
          OffsetDateTime.ofInstant(Instant.ofEpochMilli(0), ZoneOffset.UTC),
        lastOneTopic =
          OffsetDateTime.ofInstant(Instant.ofEpochMilli(0), ZoneOffset.UTC)
      )
    ))
  }
}
