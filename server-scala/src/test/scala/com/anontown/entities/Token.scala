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

class TokenSpec extends FunSpec with Matchers {}
