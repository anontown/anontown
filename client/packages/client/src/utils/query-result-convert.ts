import { QueryResult } from "@apollo/react-common";

// https://github.com/apollographql/apollo-client/issues/1389
export function queryResultConvert<TData, TVar>(
  res: QueryResult<TData, TVar>,
): QueryResult<TData, TVar> {
  if (res.data !== undefined) {
    if (Object.keys(res.data).length === 0) {
      res.data = undefined;
    }
  }
  return res;
}
