export function raise(e: unknown): never {
  throw e;
}

export function unreachable(): never {
  throw new Error("unreachable");
}

export function typeCheckedUnreachable(_x: never): never {
  throw new Error("type checked unreachable");
}
