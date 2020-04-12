import { RaisedButton, TextField } from "material-ui";
import * as React from "react";
import * as G from "../generated/graphql";
import { UserData } from "../domains/entities";
import { Errors } from "./errors";
import { MdEditor } from "./md-editor";
import { TagsInput } from "./tags-input";
import { RA } from "../prelude";

interface TopicEditorProps {
  topic: G.TopicNormalFragment;
  onUpdate?: (topic: G.TopicNormalFragment) => void;
  userData: UserData;
}

interface TopicEditorState {
  title: string;
  tags: ReadonlyArray<string>;
  text: string;
}

export class TopicEditor extends React.Component<
  TopicEditorProps,
  TopicEditorState
> {
  constructor(props: TopicEditorProps) {
    super(props);
    this.state = {
      title: this.props.topic.title,
      tags: this.props.topic.tags,
      text: this.props.topic.text,
    };
  }

  render() {
    return (
      <G.UpdateTopicComponent
        variables={{
          id: this.props.topic.id,
          title: this.state.title,
          text: this.state.text,
          tags: RA.toArray(this.state.tags), // TODO: コピーしない
        }}
        onCompleted={data => {
          if (this.props.onUpdate) {
            this.props.onUpdate(data.updateTopic);
          }
        }}
      >
        {(submit, { error }) => {
          return (
            <form>
              {error && <Errors errors={["エラーが発生しました"]} />}
              <TextField
                fullWidth={true}
                floatingLabelText="タイトル"
                value={this.state.title}
                onChange={(_e, v) => this.setState({ title: v })}
              />
              <TagsInput
                value={this.state.tags}
                onChange={v => this.setState({ tags: v })}
                fullWidth={true}
              />
              <MdEditor
                fullWidth={true}
                value={this.state.text}
                onChange={v => this.setState({ text: v })}
              />
              <RaisedButton onClick={() => submit()} label="OK" />
            </form>
          );
        }}
      </G.UpdateTopicComponent>
    );
  }
}
