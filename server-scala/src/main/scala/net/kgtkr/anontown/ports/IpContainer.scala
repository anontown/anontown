package net.kgtkr.anontown.ports;

trait IpContainer {
  def getIp(): Option[String];
}

trait IpContainerComponent {
  val ipContainer: IpContainer;
}
