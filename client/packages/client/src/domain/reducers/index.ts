import { initialState, State } from "../state";
import { composeReducers } from "./compose-reducers";
import { Action } from "../actions";
import { Reducer } from "react";

export const reducer: Reducer<State, Action> = composeReducers(
  initialState,
  [],
);
