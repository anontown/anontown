package com.anontown

package object extra {
  @inline implicit def wrapStringExtra(self: String): StringExtra =
    new StringExtra(self)
}
