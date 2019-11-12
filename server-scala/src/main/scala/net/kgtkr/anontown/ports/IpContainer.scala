package net.kgtkr.anontown.ports;

trait IpContainer {
  val requestIp: Option[String];
}

trait IpContainerComponent {
  val ipContainer: IpContainer;
}
