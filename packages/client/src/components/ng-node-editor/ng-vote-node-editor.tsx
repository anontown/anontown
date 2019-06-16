import { ListItem, TextField } from "material-ui";
import * as React from "react";
import { ng } from "../../models";
import { Modal } from "../modal";

export interface NGVoteNodeEditorProps {
  value: ng.NGNodeVote;
  onChange: (node: ng.NGNodeVote) => void;
  select: JSX.Element;
  nestedLevel: number;
  rightIconButton?: React.ReactElement<any>;
  openDialog: boolean;
  changeOpenDialog: (v: boolean) => void;
}

export interface NGVoteNodeEditorState {}

export class NGVoteNodeEditor extends React.Component<
  NGVoteNodeEditorProps,
  NGVoteNodeEditorState
> {
  constructor(props: NGVoteNodeEditorProps) {
    super(props);
    this.state = {};
  }

  render() {
    return (
      <>
        <Modal
          isOpen={this.props.openDialog}
          onRequestClose={() => this.props.changeOpenDialog(false)}
        >
          {this.props.select}
          <TextField
            floatingLabelText="しきい値"
            type="number"
            value={this.props.value.value.toString()}
            onChange={(_e, v) => {
              const newV = +v;
              if (this.props.value.type === "vote" && !isNaN(newV)) {
                this.props.onChange({
                  ...this.props.value,
                  value: newV,
                });
              }
            }}
          />
        </Modal>
        <ListItem
          nestedLevel={this.props.nestedLevel}
          rightIconButton={this.props.rightIconButton}
          onClick={() => this.props.changeOpenDialog(true)}
          primaryText={`Vote:${this.props.value.value}`}
        />
      </>
    );
  }
}
