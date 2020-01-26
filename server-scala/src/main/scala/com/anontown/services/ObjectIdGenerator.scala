package com.anontown.services;
import zio.IO
import com.anontown.AtServerError

trait ObjectIdGenerator {
  def generateObjectId(): IO[AtServerError, String];
}

trait ObjectIdGeneratorComponent {
  val objectIdGenerator: ObjectIdGenerator;
}
