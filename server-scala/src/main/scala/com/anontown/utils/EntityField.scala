package com.anontown.utils

import monocle.syntax.ApplyLens

trait EntityField[U, +A[+_ <: U], +X <: U] {
  val self: A[X]
  def get: X;
  def set[X2 >: X <: U](x: X2): A[X2];
  def modify[X2 >: X <: U](f: X => X2): A[X2] = this.set(f(this.get))
}

object EntityField {
  type Bivariant[A, X] = EntityField[X, ({ type λ[+_] = A })#λ, X]

  def fromApplyLens[A, X](
      applyLens: ApplyLens[A, A, X, X]
  ): Bivariant[A, X] =
    new EntityField[X, ({ type λ[+_] = A })#λ, X] {
      val self = applyLens.s
      def get = applyLens.get
      def set[X2 >: X <: X](x: X2) = applyLens.set(x)
    }

  object implicits {
    implicit class ToEntityField[A, X](self: ApplyLens[A, A, X, X]) {
      def toEntityField: Bivariant[A, X] = EntityField.fromApplyLens(self)
    }
  }

}
