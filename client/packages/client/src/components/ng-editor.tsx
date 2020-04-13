import { List, TextField } from "material-ui";
import * as React from "react";
import { ng } from "../domains/entities";
import { NGNodeEditor } from "./ng-node-editor";

export interface NGEditorProps {
  ng: ng.NG;
  onUpdate: (ng: ng.NG) => void;
}
// TODO:expirationDate,chain,transparent
export function NGEditor(props: NGEditorProps) {
  return (
    <div>
      <TextField
        floatingLabelText="名前"
        value={props.ng.name}
        onChange={(_e, v) => props.onUpdate({ ...props.ng, name: v })}
      />
      <TextField
        floatingLabelText="トピック"
        value={props.ng.topic || ""}
        onChange={(_e, v) => props.onUpdate({ ...props.ng, topic: v || null })}
      />
      <List>
        <NGNodeEditor
          nestedLevel={0}
          value={props.ng.node}
          onChange={v => props.onUpdate({ ...props.ng, node: v })}
        />
      </List>
    </div>
  );
}
