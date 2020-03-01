package com.anontown;

object App {
  def main(args: Array[String]): Unit = {
    args match {
      case Array() => {}
      case _       => println("Not Found Command")
    }
  }
}
