package com.anontown.macros

import scala.reflect.macros.Context
import scala.language.experimental.macros
import scala.annotation.StaticAnnotation

class lensTypeClass extends StaticAnnotation {
  def macroTransform(annottees: Any*): Any = macro LensTypeClassMacro.impl
}

object LensTypeClassMacro {
  def impl(c: Context)(annottees: c.Expr[Any]*): c.Expr[Any] = {
    import c.universe._

    annottees.map(_.tree) match {
      case (typeClass: ClassDef) :: Nil => {
        val filteredBody = typeClass.impl.body.map {
          case lens @ q"def $name: Lens[$tself, $tpt];"
              if name.decoded.endsWith("Lens") =>
            val lensName = name.decoded.substring(0, name.decoded.length - 4);
            val upperLensName = lensName
              .substring(0, 1)
              .toUpperCase() + lensName.substring(1);
            List(
              lens,
              q"def ${TermName(lensName)}(self: ${tself}): ${tpt} = this.${name}.get(self);",
              q"def ${TermName("with" + upperLensName)}(self: ${tself})(value: ${tpt}): ${tself} = this.${name}.set(value)(self);",
              q"def ${TermName("modify" + upperLensName)}(self: ${tself})(updater: ${tpt} => ${tpt}): ${tself} = this.${name}.modify(updater)(self);"
            )
          case other => List(other)
        };

        val filteredImpl =
          Template(
            typeClass.impl.parents,
            typeClass.impl.self,
            filteredBody.flatten
          )

        val modifiedTypeClass = ClassDef(
          typeClass.mods,
          typeClass.name,
          typeClass.tparams,
          filteredImpl
        )

        c.Expr(q"""
          $modifiedTypeClass
        """)
      }
    }
  }
}
