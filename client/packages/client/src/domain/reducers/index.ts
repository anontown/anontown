import { initialState, State } from "../state";
import { composeReducers } from "./compose-reducers";
import { Action } from "../actions";

export const reducer = composeReducers<State, Action>(initialState, []);
