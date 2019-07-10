import * as t from "io-ts";

export interface RouteData<PA, PO, QA, QO> {
  readonly path: string;
  readonly params: t.Type<PA, PO>;
  readonly query: t.Type<QA, QO>;
}

export class RouteDataBuilder<PA, PO, QA, QO> {
  constructor(public value: RouteData<PA, PO, QA, QO>) {}

  static fromPath(path: string): RouteDataBuilder<{}, {}, {}, {}> {
    return new RouteDataBuilder({
      path,
      params: t.type({}),
      query: t.type({})
    });
  }

  params<A, O>(params: t.Type<A, O>): RouteDataBuilder<A, O, QA, QO> {
    return new RouteDataBuilder({ ...this.value, params });
  }

  query<A, O>(query: t.Type<A, O>): RouteDataBuilder<PA, PO, A, O> {
    return new RouteDataBuilder({ ...this.value, query });
  }
}

export function queryArray<C extends t.Mixed>(codec: C) {
  return t.union([codec, t.array(codec), t.undefined, t.null]);
}

export function queryOne<C extends t.Mixed>(codec: C) {
  return t.union([codec, t.undefined, t.null]);
}
