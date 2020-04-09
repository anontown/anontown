import * as qs from "query-string";
import { LocationDescriptorObject } from "history";

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
    .map((x) => {
      if (x.type === "const") {
        return x.value;
      } else {
        return variableNameToString(x.name);
      }
    })
    .map((x) => `/${x}`)
    .join("");
}

function pathDataToPath<T extends string>(
  pathData: PathData<T>,
  params: Record<T, string>
): string {
  return pathDataToString(pathData, (name) => encodeURIComponent(params[name]));
}

function pathDataToMatcher<T extends string>(pathData: PathData<T>): string {
  return pathDataToString(pathData, (name) => `:${name}`);
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
      { type: "variable", name },
    ]);
  }
}

export type ParsedQueryValue = string | string[] | null | undefined;

type RouteDataToParamNames<T> = T extends RouteData<infer P, any> ? P : never;

export type RouteDataToParams<T> = Record<RouteDataToParamNames<T>, string>;

export class RouteData<P extends string, Q extends object> {
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
    public decodeQuery: (query: Partial<Q>) => qs.ParsedQuery
  ) {}

  static create<P extends string>(
    pathDataBuilder: PathDataBuilder<P>
  ): RouteData<P, {}> {
    return new RouteData(
      pathDataBuilder.value,
      () => ({}),
      () => ({})
    );
  }

  static createWithQuery<P extends string, Q extends object>(
    pathDataBuilder: PathDataBuilder<P>,
    encodeQuery: (query: qs.ParsedQuery) => Q,
    decodeQuery: (query: Partial<Q>) => qs.ParsedQuery
  ): RouteData<P, Q> {
    return new RouteData(pathDataBuilder.value, encodeQuery, decodeQuery);
  }

  matcher(): string {
    return pathDataToMatcher(this.pathData);
  }

  to(
    params: Record<P, string>,
    {
      query,
      state,
    }: {
      query?: Partial<Q>;
      state?: any;
    } = {}
  ): LocationDescriptorObject {
    return {
      pathname: pathDataToPath(this.pathData, params),
      search:
        query !== undefined ? qs.stringify(this.decodeQuery(query)) : undefined,
      state: state,
    };
  }

  parseQuery(query: string): Q {
    return this.encodeQuery(qs.parse(query));
  }

  parsePathData(data: string[]): Record<P, string> {
    return this.pathData
      .filter((x): x is PathDataElementVariable<any> => x.type === "variable")
      .reduce<any>((result, x, i) => {
        result[x.name] = data[i];
      }, {});
  }
}
