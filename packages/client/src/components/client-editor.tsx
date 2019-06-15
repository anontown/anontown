import { RaisedButton, TextField } from "material-ui";
import * as React from "react";
import * as G from "../../generated/graphql";
import { UserData } from "../models";
import { Errors } from "./errors";

interface ClientEditorProps {
  client: G.ClientFragment;
  onUpdate?: (client: G.ClientFragment) => void;
  userData: UserData;
}

interface ClientEditorState {
  url: string;
  name: string;
}

export class ClientEditor extends React.Component<ClientEditorProps, ClientEditorState> {
  constructor(props: ClientEditorProps) {
    super(props);
    this.state = {
      url: props.client.url,
      name: props.client.name,
    };
  }

  render() {
    return (
      <G.UpdateClientComponent
        variables={{
          id: this.props.client.id,
          name: this.state.name,
          url: this.state.url,
        }}
        onCompleted={data => {
          if (this.props.onUpdate) {
            this.props.onUpdate(data.updateClient);
          }
        }}
      >{
          (submit, { error }) => {
            return (<form>
              {error && <Errors errors={["更新に失敗"]} />}
              <TextField
                floatingLabelText="名前"
                value={this.state.name}
                onChange={(_e, v) => this.setState({ name: v })}
              />
              <TextField
                floatingLabelText="url"
                value={this.state.url}
                onChange={(_e, v) => this.setState({ url: v })}
              />
              <RaisedButton onClick={() => submit()} label="OK" />
            </form>);
          }}
      </G.UpdateClientComponent>
    );
  }
}
