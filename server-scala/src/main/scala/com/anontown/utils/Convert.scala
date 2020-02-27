package com.anontown.utils

import shapeless.{Generic, Coproduct, :+:, Inl};
import shapeless.Inr

trait Convert[A, B] {
  def convert(a: A): B
}

object Convert {
  def apply[A, B](implicit ev: Convert[A, B]) = ev

  def from[A, B](f: A => B): Convert[A, B] = new Convert[A, B] {
    def convert(a: A): B = f(a)
  }

  implicit def convertId[A]: Convert[A, A] = Convert.from(a => a)

  def derive[A, B, R](
      implicit gen: Generic.Aux[B, R],
      cv: MkConvert[A, R]
  ): Convert[A, B] = Convert.from(a => gen.from(cv.convert(a)))
}

trait MkConvert[A, B] extends Convert[A, B];

object MkConvert {
  implicit def convertHead[A, T <: Coproduct]: MkConvert[A, A :+: T] =
    new MkConvert[A, A :+: T] {
      def convert(a: A): A :+: T = Inl(a)
    }

  implicit def convertTail[A, H, T <: Coproduct](
      implicit mkCv: MkConvert[A, T]
  ): MkConvert[A, H :+: T] =
    new MkConvert[A, H :+: T] {
      def convert(a: A): H :+: T = Inr(mkCv.convert(a))
    }
}
