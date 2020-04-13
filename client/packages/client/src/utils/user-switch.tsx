import * as React from "react";
import { Omit } from "type-zoo";
import { UserContext } from "../hooks";
import { UserData } from "../domains/entities";

export interface UserSwitchProps {
  userData: UserData;
  updateUserData: (value: UserData | null) => void;
}

export function userSwitch<P extends UserSwitchProps>(
  Children: React.ComponentType<P>,
) {
  return (props: Omit<P, keyof UserSwitchProps>): JSX.Element => {
    return (
      <UserContext.Consumer>
        {val =>
          val.value !== null ? (
            <Children
              {...(props as any)}
              userData={val.value}
              updateUserData={val.update}
            />
          ) : (
            <div>ログインして下さい</div>
          )
        }
      </UserContext.Consumer>
    );
  };
}
