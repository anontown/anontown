import { Either, isRight } from "fp-ts/lib/Either";

export function unwrapEither<L, R>(x: Either<L, R>): R {
  if (isRight(x)) {
    return x.right;
  } else {
    throw x.left;
  }
}
