import * as React from "react";
import { UserData } from "src/models";
import { Omit } from "type-zoo";
import { UserContext } from "./user";

export interface UserSwitchProps {
    userData: UserData;
    updateUserData: (value: UserData | null) => void;
}

export function userSwitch<P extends UserSwitchProps>(Children: React.ComponentType<P>)
    : React.ComponentType<Omit<P, keyof UserSwitchProps>> {
    return (props: Omit<P, keyof UserSwitchProps>) => {
        return (
            <UserContext.Consumer>
                {val => val.value !== null
                    ? <Children {...props as any} userData={val.value} updateUserData={val.update} />
                    : <div>ログインして下さい</div>}
            </UserContext.Consumer>
        );
    };
}
