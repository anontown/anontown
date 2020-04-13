import { QueryResult } from "@apollo/react-common";

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
