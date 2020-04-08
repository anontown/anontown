package com.anontown.entities

import cats.kernel.Eq
import cats.kernel.Monoid
import cats.Show
import cats.kernel.Order
import cats.implicits._

final case class Interval(milli: Long) {
  def unary_- : Interval = Interval(-this.milli)

  def unary_+ : Interval = this

  def +(other: Interval): Interval =
    Interval(this.milli + other.milli)

  def -(other: Interval): Interval = this + (-other)

  def *(n: Long): Interval =
    Interval(this.milli * n)

  def /(n: Long): Interval = Interval(this.milli / n)
}

object Interval {
  implicit val eq: Eq[Interval] = Eq.fromUniversalEquals;
  implicit val monoid: Monoid[Interval] = new Monoid[Interval] {
    def empty: Interval = Interval(0)
    def combine(a: Interval, b: Interval): Interval = a + b
  }

  implicit val show: Show[Interval] = Show.fromToString

  implicit val order: Order[Interval] = Order.by(_.milli)

  def fromMillis(x: Long): Interval = Interval(x)
  def fromSeconds(x: Long): Interval = Interval.fromMillis(x) * 1000
  def fromMinutes(x: Long): Interval = Interval.fromSeconds(x) * 60
  def fromHours(x: Long): Interval = Interval.fromMinutes(x) * 60
  def fromDays(x: Long): Interval = Interval.fromHours(x) * 24
}
