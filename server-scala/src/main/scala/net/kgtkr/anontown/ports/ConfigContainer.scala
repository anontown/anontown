package net.kgtkr.anontown.ports

import net.kgtkr.anontown.Config

trait ConfigContainer {
  val config: Config;
}

trait ConfigContainerComponent {
  val configContainer: ConfigContainer;
}
