package com.anontown.entities

import org.scalatest._
import org.mongodb.scala.bson.ObjectId
import java.time.OffsetDateTime
import java.time.ZoneOffset
import com.anontown.ports.ObjectIdGenerator
import com.anontown.ports.Clock
import com.anontown.ports.ObjectIdGeneratorComponent
import com.anontown.ports.ClockComponent
import com.anontown.adapters.ClockImpl
import com.anontown.ports.ConfigContainerComponent
import com.anontown.adapters.ConfigContainerImpl
import com.anontown.ConfigFixtures
import com.anontown.adapters.DummyObjectIdGeneratorImpl
import com.anontown.adapters.DummyConfigContainerImpl
import com.anontown.adapters.DummySafeIdGeneratorImpl
import com.anontown.ports.ConfigContainer
import com.anontown.TestHelper
import zio.ZIO
import com.anontown.utils.ZIOUtils._
import com.anontown.utils.OffsetDateTimeUtils
import com.anontown.AuthUser
import com.anontown.ports.SafeIdGeneratorComponent
import com.anontown.ports.SafeIdGenerator

object TokenFixtures {
  val tokenID = new ObjectId().toHexString()
  val tokenMaster =
    TokenMaster(
      id = TokenId(tokenID),
      key = "key",
      user = UserId(UserFixtures.userID),
      date = OffsetDateTimeUtils.ofEpochMilli(0)
    );
}

class TokenSpec extends FunSpec with Matchers {
  describe("createTokenKey") {
    it("正常に生成出来るか") {
      TestHelper.runZio(
        TestHelper.createPorts(safeIdIt = Iterator("a", "b"))
      ) {
        (for {
          key1 <- Token.createTokenKey()
          key2 <- Token.createTokenKey()
        } yield {
          key1 should not be (key2)
        })
      }
    }

    describe("TokenMaster") {
      describe("create") {
        it("正常に生成出来るか") {
          TestHelper.runZio(
            TestHelper.createPorts(
              objectIdIt = Iterator("token"),
              safeIdIt = Iterator("key"),
              requestDate = OffsetDateTimeUtils.ofEpochMilli(100)
            )
          ) {
            (for {
              token <- TokenMaster
                .create(
                  authUser = AuthUser(
                    id = UserId("user"),
                    pass = UserEncryptedPass("pass")
                  )
                )
            } yield {
              token should be(
                TokenMaster(
                  id = TokenId("token"),
                  key = TestHelper.runZio(
                    TestHelper.createPorts(
                      safeIdIt = Iterator("key")
                    )
                  )(Token.createTokenKey()),
                  user = UserId("user"),
                  date = OffsetDateTimeUtils.ofEpochMilli(100)
                )
              );
            })
          }
        }
      }
    }
  }
}
