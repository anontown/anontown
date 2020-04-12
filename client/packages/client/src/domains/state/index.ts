import { RouterState } from "connected-react-router";

export interface AppState {}

export const initialAppState: AppState = {};

export interface RootState {
  app: AppState;
  router: RouterState;
}
