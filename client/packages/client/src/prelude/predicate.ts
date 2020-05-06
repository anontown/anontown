export function isNotNull<A>(x: A | null): x is A {
  return x !== null;
}
