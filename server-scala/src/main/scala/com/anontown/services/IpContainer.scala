package com.anontown.services;

trait IpContainer {
  val requestIp: Option[String];
}

trait IpContainerComponent {
  val ipContainer: IpContainer;
}
