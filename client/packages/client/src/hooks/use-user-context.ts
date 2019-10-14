import * as React from "react";
import { UserData } from "../models";

export interface UserContextType {
  value: UserData | null;
  update: (value: UserData | null) => void;
}

export const UserContext = React.createContext<UserContextType>({
  value: null,
  // tslint:disable-next-line:no-empty
  update: () => {},
});

export function useUserContext() {
  return React.useContext(UserContext);
}
