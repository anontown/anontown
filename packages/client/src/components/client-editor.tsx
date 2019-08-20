import { RaisedButton, TextField } from "material-ui";
import * as React from "react";
import * as G from "../generated/graphql";
import { UserData } from "../models";
import { Errors } from "./errors";

interface ClientEditorProps {
  client: G.ClientFragment;
  onUpdate?: (client: G.ClientFragment) => void;
  userData: UserData;
}

export function ClientEditor(props: ClientEditorProps) {
  const [url, setUrl] = React.useState(props.client.url);
  const [name, setName] = React.useState(props.client.name);
  const [submit, data] = G.useUpdateClientMutation();

  return (
    <form>
      {data.error && <Errors errors={["更新に失敗"]} />}
      <TextField
        floatingLabelText="名前"
        value={name}
        onChange={(_e, v) => setName(v)}
      />
      <TextField
        floatingLabelText="url"
        value={url}
        onChange={(_e, v) => setUrl(v)}
      />
      <RaisedButton
        onClick={async () => {
          const result = await submit({
            variables: {
              id: props.client.id,
              name,
              url,
            },
          });
          if (props.onUpdate !== undefined && result.data !== undefined) {
            props.onUpdate(result.data.updateClient);
          }
        }}
        label="OK"
      />
    </form>
  );
}
