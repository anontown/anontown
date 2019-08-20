import { FontIcon, IconButton } from "material-ui";
import * as React from "react";
import { useToggle } from "react-use";
import * as G from "../generated/graphql";
import { UserData } from "../models";
import { ClientEditor } from "./client-editor";

interface ClientProps {
  client: G.ClientFragment;
  onUpdate?: (client: G.ClientFragment) => void;
  userData: UserData | null;
}

export function Client(props: ClientProps) {
  const [edit, toggleEdit] = useToggle(false);

  return (
    <div>
      <h2>{props.client.name}</h2>
      <span>{props.client.id}</span>
      <span>{props.client.url}</span>
      {props.client.self ? (
        <div>
          <IconButton type="button" onClick={() => toggleEdit()}>
            <FontIcon className="material-icons">edit</FontIcon>
          </IconButton>
          {edit && props.userData !== null ? (
            <ClientEditor
              client={props.client}
              onUpdate={props.onUpdate}
              userData={props.userData}
            />
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
