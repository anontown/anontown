import * as React from "react";
import * as rx from "rxjs";
import * as op from "rxjs/operators";
import { UserData } from "../domains/entities";
import * as G from "../generated/graphql";
import {
  useEffectRef,
  useEffectSkipN,
  UserContext,
  UserContextType,
} from "../hooks";
import { useSave } from "../effects/storage-api";

// TODO: 最悪な実装なのであとで何とかする
let _auth: G.TokenMasterFragment | null = null;
function setAuth(auth: G.TokenMasterFragment | null) {
  _auth = auth;
}

export function getAuth(): G.TokenMasterFragment | null {
  return _auth;
}

export interface UserProps {
  children: (user: UserContextType) => React.ReactNode;
  initUserData: UserData | null;
}

export const User = (props: UserProps) => {
  const [userData, setUserData] = React.useState(props.initUserData);
  setAuth(props.initUserData !== null ? props.initUserData.token : null);
  const subjectRef = React.useRef(new rx.Subject<UserData | null>());
  useEffectSkipN(() => {
    subjectRef.current.next(userData);
  }, [userData]);
  const storageSave = useSave();
  useEffectRef(
    f => {
      const subs = subjectRef.current
        .pipe(op.debounceTime(5000))
        .subscribe(data => {
          f.current(data);
        });

      return () => {
        subs.unsubscribe();
      };
    },
    (data: UserData | null) => {
      if (data !== null) {
        storageSave(data.storage);
      }
    },
    [],
  );

  useEffectSkipN(() => {
    if (userData !== null) {
      localStorage.setItem(
        "token",
        JSON.stringify({
          id: userData.token.id,
          key: userData.token.key,
        }),
      );
    } else {
      localStorage.removeItem("token");
    }
  }, [userData !== null ? userData.token.id : null]);

  useEffectSkipN(() => {
    location.reload();
  }, [userData !== null ? userData.id : null]);

  const context: UserContextType = {
    value: userData,
    update: x => {
      setUserData(x);
      setAuth(x !== null ? x.token : null);
    },
  };

  return (
    <UserContext.Provider value={context}>
      {props.children(context)}
    </UserContext.Provider>
  );
};
