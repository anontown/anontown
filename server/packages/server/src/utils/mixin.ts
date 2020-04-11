// https://www.typescriptlang.org/docs/handbook/mixins.html

export function applyMixins(derivedCtor: any, baseCtors: Array<any>) {
  baseCtors.forEach(baseCtor => {
    Object.getOwnPropertyNames(baseCtor.prototype).forEach(name => {
      derivedCtor.prototype[name] = baseCtor.prototype[name];
    });
  });
}
