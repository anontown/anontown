import { RaisedButton, TextField } from "material-ui";
import * as React from "react";
import * as G from "../generated/graphql";
import { UserData } from "../models";
import { Card } from "../styled/card";
import { Errors } from "./errors";
import { MdEditor } from "./md-editor";

interface ProfileEditorProps {
  profile: G.ProfileFragment;
  onUpdate?: (profile: G.ProfileFragment) => void;
  userData: UserData;
  style?: React.CSSProperties;
}

export const ProfileEditor = (props: ProfileEditorProps) => {
  const [errors, setErrors] = React.useState<Array<string>>([]);
  const [sn, setSn] = React.useState(props.profile.sn);
  const [name, setName] = React.useState(props.profile.name);
  const [text, setText] = React.useState(props.profile.text);
  const [submit] = G.useUpdateProfileMutation({
    variables: {
      id: props.profile.id,
      name,
      text,
      sn,
    },
  });

  return (
    <Card style={props.style}>
      <form>
        <Errors errors={errors} />
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
          onClick={() =>
            submit()
              .then(data => {
                if (props.onUpdate) {
                  props.onUpdate(data.data!.updateProfile);
                }
                setErrors([]);
              })
              .catch(_e => {
                setErrors(["エラーが発生しました"]);
              })
          }
          label="OK"
        />
      </form>
    </Card>
  );
};
