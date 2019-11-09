import { initialState, State } from "../state";
import { Action } from "../actions";

export function reducer(state: State = initialState, action: Action): State {
  switch (action.type) {
    default:
      return state;
  }
}
