package com.anontown;

import sangria.renderer.SchemaRenderer

object App {
  def main(args: Array[String]): Unit = {
    args match {
      case Array() => {}
      case Array("generate-schema") => {
        import com.anontown.application.resolvers.AppSchema;

        val schema = AppSchema.getSchema();

        println(SchemaRenderer.renderSchema(schema))

      }
      case _ => println("Not Found Command")
    }
  }
}
