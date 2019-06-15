import { Paper, RaisedButton, TextField } from "material-ui";
import * as React from "react";
import * as G from "../../generated/graphql";
import { UserData } from "../models";
import { Errors } from "./errors";
import { MdEditor } from "./md-editor";
import * as style from "./profile-add.scss";

interface ProfileAddProps {
  onAdd?: (profile: G.ProfileFragment) => void;
  userData: UserData;
  style?: React.CSSProperties;
}

interface ProfileAddState {
  sn: string;
  name: string;
  text: string;
}

export class ProfileAdd extends React.Component<ProfileAddProps, ProfileAddState> {
  constructor(props: ProfileAddProps) {
    super(props);
    this.state = {
      sn: "",
      name: "",
      text: "",
    };
  }

  render() {
    return (
      <Paper className={style.container} style={this.props.style}>
        <G.CreateProfileComponent
          variables={{
            name: this.state.name,
            text: this.state.text,
            sn: this.state.sn,
          }}
          onCompleted={x => {
            if (this.props.onAdd) {
              this.props.onAdd(x.createProfile);
            }
          }}
        >{(submit, { error }) => {
          return (<form>
            {error && <Errors errors={["エラーが発生しました"]} />}
            <TextField
              fullWidth={true}
              floatingLabelText="ID"
              value={this.state.sn}
              onChange={(_e, v) => this.setState({ sn: v })}
            />
            <TextField
              fullWidth={true}
              floatingLabelText="名前"
              value={this.state.name}
              onChange={(_e, v) => this.setState({ name: v })}
            />
            <MdEditor
              fullWidth={true}
              value={this.state.text}
              onChange={v => this.setState({ text: v })}
            />
            <RaisedButton onClick={() => submit()} label="OK" />
          </form>);
        }}
        </G.CreateProfileComponent>
      </Paper>
    );
  }
}
