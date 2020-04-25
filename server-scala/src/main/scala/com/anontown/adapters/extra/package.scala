package com.anontown.adapters

package object extra {
  import org.mongodb.scala.MongoCollection
  import org.mongodb.scala._
  @inline implicit def wrapMongoCollectionExtra(
      self: MongoCollection[Document]
  ): MongoCollectionExtra = new MongoCollectionExtra(self)
}
