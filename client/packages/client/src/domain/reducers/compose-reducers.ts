import { Reducer } from "react";

export function composeReducers<S, A>(
  init: S,
  reducers: Reducer<S, A>[],
): Reducer<S, A> {
  return (state: S = init, action: A): S =>
    reducers.reduce((prev, f) => f(prev, action), state);
}
