package net.kgtkr.anontown.adapters
import net.kgtkr.anontown.Config
import net.kgtkr.anontown.ports.ConfigContainer
import net.kgtkr.anontown.ConfigFixtures

class DummyConfigContainerImpl extends ConfigContainer {
  val config: Config = ConfigFixtures.config
}
