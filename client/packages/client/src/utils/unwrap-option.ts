import * as FTO from "fp-ts/lib/Option";

export function unwrapOption<A>(x: FTO.Option<A>): A {
  if (FTO.isSome(x)) {
    return x.value;
  } else {
    throw new Error();
  }
}
