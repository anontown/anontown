import * as React from "react";
import { UserData } from "../domains/entities";

export interface UserContextType {
  value: UserData | null;
  update: (value: UserData | null) => void;
}

export const UserContext = React.createContext<UserContextType>({
  value: null,
  update: () => {},
});

export function useUserContext() {
  return React.useContext(UserContext);
}
