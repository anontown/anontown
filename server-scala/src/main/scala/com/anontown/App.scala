package com.anontown;

import sangria.renderer.SchemaRenderer

object App {
  def main(args: Array[String]): Unit = {
    args match {
      case Array() => {}
      case Array("generate-schema") => {
        import com.anontown.application.resolvers.AppSchema;
        import scala.concurrent.ExecutionContext.Implicits.global
        import cats.effect.IO.contextShift

        implicit val cs = contextShift(implicitly)

        val schema = AppSchema.createSchema();

        println(SchemaRenderer.renderSchema(schema))

      }
      case _ => println("Not Found Command")
    }
  }
}
