import { routerActions } from "connected-react-router";
import { ActionType, createAction } from "typesafe-actions";

export const nop = createAction("NOP")();

export const appActions = { nop };

export type RootAction = ActionType<{
  app: typeof appActions;
  router: typeof routerActions;
}>;
