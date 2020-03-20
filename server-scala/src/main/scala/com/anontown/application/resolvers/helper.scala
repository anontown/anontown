package com.anontown.application.resolvers

import sangria.schema.Field
import sangria.schema.Context
import sangria.schema.Action
import sangria.schema.OutputType
import sangria.schema.Argument
import shapeless.{HList, ::}
import simulacrum.typeclass
import shapeless.HNil
import sangria.schema.{StringType, IntType}
import shapeless.Generic
import sangria.schema.InputType
import sangria.marshalling.FromInput
import sangria.schema.WithoutInputTypeTags

@typeclass
trait ArgTypeHList[L <: HList] {
  type ArgHList <: HList;

  def ctxToArgs[Ctx, Val](args: ArgHList, ctx: Context[Ctx, Val]): L;

  def toArguments(args: ArgHList): List[Argument[_]];
}

object ArgTypeHList {
  type Aux[L <: HList, Out0 <: HList] =
    ArgTypeHList[L] { type ArgHList = Out0 }

  implicit val hnilToArgTypes: Aux[HNil, HNil] = new ArgTypeHList[HNil] {
    type ArgHList = HNil;

    def ctxToArgs[Ctx, Val](args: HNil, ctx: Context[Ctx, Val]) = HNil

    def toArguments(args: HNil) = Nil
  }
  implicit def hlistToArgTypes[H, T <: HList, OutM <: HList](
      implicit tat: Aux[T, OutM]
  ): Aux[H :: T, Argument[H] :: OutM] =
    new ArgTypeHList[H :: T] {
      type ArgHList = Argument[H] :: OutM;

      def ctxToArgs[Ctx, Val](args: ArgHList, ctx: Context[Ctx, Val]) =
        ctx.arg(args.head) :: tat.ctxToArgs(args.tail, ctx)

      def toArguments(args: ArgHList) =
        (args.head: Argument[_]) :: tat.toArguments(args.tail)
    }
}

object Helper {
  final class FieldPartiallyApplied[
      Out,
      ArgTypes
  ] {
    def apply[Ctx, Val, ArgTypesRepr <: HList, Arg, ArgRepr <: HList](
        name: String,
        args: Arg,
        resolve: (Context[Ctx, Val], ArgTypes) => Action[Ctx, Out]
    )(
        implicit out: OutputType[Out],
        argTypesGeneric: Generic.Aux[ArgTypes, ArgTypesRepr],
        argGeneric: Generic.Aux[Arg, ArgRepr],
        ath: ArgTypeHList.Aux[ArgTypesRepr, ArgRepr]
    ): Field[Ctx, Val] = {
      Field[Ctx, Val, Out, Out](
        name,
        implicitly[OutputType[Out]],
        arguments = ath.toArguments(argGeneric.to(args)),
        resolve = ctx => {
          resolve(
            ctx,
            argTypesGeneric.from(ath.ctxToArgs(argGeneric.to(args), ctx))
          )
        }
      )
    }
  }

  def field[Out, ArgTypes]: FieldPartiallyApplied[Out, ArgTypes] =
    new FieldPartiallyApplied
}
