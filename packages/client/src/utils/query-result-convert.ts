import { QueryHookState } from "react-apollo-hooks";

export function queryResultConvert<TData>(res: QueryHookState<TData>) {
  if (res.data !== undefined) {
    if (Object.keys(res.data).length === 0) {
      res.data = undefined;
    }
  }
  return res;
}
