import { combineEpics, Epic } from "redux-observable";
import { Action } from "../actions";
import { State } from "../state";

export const epics: Epic<Action, Action, State, unknown> = combineEpics();
