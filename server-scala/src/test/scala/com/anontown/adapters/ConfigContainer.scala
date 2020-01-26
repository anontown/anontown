package com.anontown.adapters
import com.anontown.Config
import com.anontown.services.ConfigContainer
import com.anontown.ConfigFixtures

class DummyConfigContainerImpl extends ConfigContainer {
  val config: Config = ConfigFixtures.config
}
