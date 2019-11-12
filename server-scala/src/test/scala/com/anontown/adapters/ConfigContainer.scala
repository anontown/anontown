package com.anontown.adapters
import com.anontown.Config
import com.anontown.ports.ConfigContainer
import com.anontown.ConfigFixtures

class DummyConfigContainerImpl extends ConfigContainer {
  val config: Config = ConfigFixtures.config
}
