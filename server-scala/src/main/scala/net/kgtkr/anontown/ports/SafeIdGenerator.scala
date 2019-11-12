package net.kgtkr.anontown.ports

trait SafeIdGenerator {
  def generateSafeId(): String
}

trait SafeIdGeneratorComponent {
  val safeIdGenerator: SafeIdGenerator;
}
