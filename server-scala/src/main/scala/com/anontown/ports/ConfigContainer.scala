package com.anontown.ports

import com.anontown.Config

trait ConfigContainer {
  val config: Config;
}

trait ConfigContainerComponent {
  val configContainer: ConfigContainer;
}
