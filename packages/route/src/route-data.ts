import * as qs from "query-string";

export type PathDataElementConst = { type: "const"; value: string };
export type PathDataElementVariable<T extends string> = {
  type: "variable";
  name: T;
};

export type PathDataElement<T extends string> =
  | PathDataElementConst
  | PathDataElementVariable<T>;

export type PathData<T extends string> = PathDataElement<T>[];

function pathDataToString<T extends string>(
  pathData: PathData<T>,
  variableNameToString: (x: T) => string
): string {
  return pathData
    .map(x => {
      if (x.type === "const") {
        return x.value;
      } else {
        return variableNameToString(x.name);
      }
    })
    .map(x => `/${x}`)
    .join("");
}

function pathDataToPath<T extends string>(
  pathData: PathData<T>,
  params: Record<T, string>
): string {
  return pathDataToString(pathData, name => params[name]);
}

function pathDataToMatcher<T extends string>(pathData: PathData<T>): string {
  return pathDataToString(pathData, name => `:${name}`);
}

export class PathDataBuilder<T extends string> {
  constructor(public value: PathData<T>) {}

  static create(): PathDataBuilder<never> {
    return new PathDataBuilder([]);
  }

  const(value: string): PathDataBuilder<T> {
    return new PathDataBuilder([...this.value, { type: "const", value }]);
  }

  variable<P extends string>(name: P): PathDataBuilder<T | P> {
    return new PathDataBuilder<T | P>([
      ...this.value,
      { type: "variable", name }
    ]);
  }
}

export type ParsedQueryValue = string | string[] | null | undefined;

type RouteDataToParamNames<T> = T extends RouteData<infer P, any> ? P : never;

export type RouteDataToParams<T> = Record<RouteDataToParamNames<T>, string>;

export class RouteData<P extends string, Q> {
  static encodeOne = (x: ParsedQueryValue): string | undefined => {
    if (x === null || x === undefined) {
      return undefined;
    }

    if (typeof x === "string") {
      return x;
    }

    return x[0];
  };

  static encodeArray = (x: ParsedQueryValue): string[] => {
    if (x === null || x === undefined) {
      return [];
    }

    if (typeof x === "string") {
      return [x];
    }

    return x;
  };

  constructor(
    public pathData: PathData<P>,
    public encodeQuery: (query: qs.ParsedQuery) => Q,
    public decodeQuery: (query: Q) => qs.ParsedQuery
  ) {}

  static create<P extends string>(
    pathDataBuilder: PathDataBuilder<P>
  ): RouteData<P, {}> {
    return new RouteData(pathDataBuilder.value, () => ({}), () => ({}));
  }

  static createWithQuery<P extends string, Q>(
    pathDataBuilder: PathDataBuilder<P>,
    encodeQuery: (query: qs.ParsedQuery) => Q,
    decodeQuery: (query: Q) => qs.ParsedQuery
  ): RouteData<P, Q> {
    return new RouteData(pathDataBuilder.value, encodeQuery, decodeQuery);
  }

  matcher(): string {
    return pathDataToMatcher(this.pathData);
  }

  path(params: Record<P, string>): string {
    return pathDataToPath(this.pathData, params);
  }

  parseQuery(query: string): Q {
    return this.encodeQuery(qs.parse(query));
  }

  stringifyQuery(query: Q): string {
    return qs.stringify(this.decodeQuery(query));
  }
}
