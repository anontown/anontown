import { RaisedButton, TextField } from "material-ui";
import * as React from "react";
import * as G from "../generated/graphql";
import { UserData } from "../models";
import { Card } from "../styled/card";
import { Errors } from "./errors";
import { MdEditor } from "./md-editor";

interface ProfileAddProps {
  onAdd?: (profile: G.ProfileFragment) => void;
  userData: UserData;
  style?: React.CSSProperties;
}

export function ProfileAdd(props: ProfileAddProps) {
  const [sn, setSn] = React.useState("");
  const [name, setName] = React.useState("");
  const [text, setText] = React.useState("");

  const [submit, { error }] = G.useCreateProfileMutation();

  return (
    <Card style={props.style}>
      <form>
        {error && <Errors errors={["エラーが発生しました"]} />}
        <TextField
          fullWidth={true}
          floatingLabelText="ID"
          value={sn}
          onChange={(_e, v) => setSn(v)}
        />
        <TextField
          fullWidth={true}
          floatingLabelText="名前"
          value={name}
          onChange={(_e, v) => setName(v)}
        />
        <MdEditor fullWidth={true} value={text} onChange={v => setText(v)} />
        <RaisedButton
          onClick={async () => {
            const result = await submit({
              variables: { name, text, sn },
            });
            if (result.data !== undefined && props.onAdd !== undefined) {
              props.onAdd(result.data.createProfile);
            }
          }}
          label="OK"
        />
      </form>
    </Card>
  );
}
