package net.kgtkr.anontown.ports;

trait ObjectIdGenerator {
  def generateObjectId(): String;
}

trait ObjectIdGeneratorComponent {
  val objectIdGenerator: ObjectIdGenerator;
}
