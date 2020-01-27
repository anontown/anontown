package com.anontown.entities

import org.scalatest._
import org.mongodb.scala.bson.ObjectId
import java.time.OffsetDateTime
import java.time.ZoneOffset
import com.anontown.services.ObjectIdGenerator
import com.anontown.services.Clock
import com.anontown.services.ObjectIdGeneratorAlg
import com.anontown.services.ClockAlg
import com.anontown.adapters.ClockImpl
import com.anontown.services.ConfigContainerAlg
import com.anontown.adapters.ConfigContainerImpl
import com.anontown.ConfigFixtures
import com.anontown.adapters.DummyObjectIdGeneratorImpl
import com.anontown.adapters.DummyConfigContainerImpl
import com.anontown.adapters.DummySafeIdGeneratorImpl
import com.anontown.services.ConfigContainer
import com.anontown.TestHelper
import zio.ZIO
import com.anontown.utils.ZIOUtils._
import com.anontown.utils.OffsetDateTimeUtils
import com.anontown.AuthUser
import com.anontown.services.SafeIdGeneratorAlg
import com.anontown.services.SafeIdGenerator
import com.anontown.AuthTokenMaster

object TokenFixtures {
  val tokenID = new ObjectId().toHexString()
  val tokenMaster =
    TokenMaster(
      id = TokenMasterId(tokenID),
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
                    id = UserId("user")
                  )
                )
            } yield {
              token should be(
                TokenMaster(
                  id = TokenMasterId("token"),
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

    describe("toAPI") {
      it("正常に変換出来るか") {
        TokenFixtures.tokenMaster.toAPI() should be(
          TokenMasterAPI(
            id = TokenFixtures.tokenID,
            key = "key",
            date = "1970-01-01T00:00Z"
          )
        )
      }
    }

    describe("auth") {
      it("正常に認証出来るか") {
        TokenFixtures.tokenMaster.auth("key") should be(
          Right(
            AuthTokenMaster(
              id = TokenMasterId(TokenFixtures.tokenID),
              user = UserId(UserFixtures.userID)
            )
          )
        )
      }

      it("keyが違う時エラーになるか") {
        assert(TokenFixtures.tokenMaster.auth("key2").isLeft)
      }
    }

    // TODO: TokenGeneral
  }
}
