import { initialState, State } from "../state";
import { composeReducers } from "./compose-reducers";
import { RootAction } from "../actions";
import { Reducer } from "react";

export const reducer = composeReducers(initialState, []);
