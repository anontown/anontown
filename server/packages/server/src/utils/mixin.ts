// TODO: そのうち消せるように

// https://www.typescriptlang.org/docs/handbook/mixins.html

export function applyMixins(derivedCtor: any, baseCtors: Array<any>) {
  baseCtors.forEach(baseCtor => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    Object.getOwnPropertyNames(baseCtor.prototype).forEach(name => {
      derivedCtor.prototype[name] = baseCtor.prototype[name];
    });
  });
}
