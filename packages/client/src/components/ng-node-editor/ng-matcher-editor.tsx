import { Checkbox, TextField } from "material-ui";
import * as React from "react";
import { ng } from "../../models";

export interface NGMatcherEditorProps {
  matcher: ng.NGNodeTextMatcher;
  onChange: (text: ng.NGNodeTextMatcher) => void;
  floatingLabelText?: string;
}
export function NGMatcherEditor(
  props: NGMatcherEditorProps,
): React.ReactElement<any> {
  return (
    <div>
      <Checkbox
        label="正規表現"
        checked={props.matcher.type === "reg"}
        onCheck={(_e, v) => {
          if (v) {
            props.onChange({
              ...props.matcher,
              type: "reg",
            });
          } else {
            props.onChange({
              ...props.matcher,
              type: "text",
            });
          }
        }}
      />
      <Checkbox
        label="大小文字区別しない"
        checked={props.matcher.i}
        onCheck={(_e, v) => {
          props.onChange({
            ...props.matcher,
            i: v,
          });
        }}
      />
      <TextField
        multiLine={true}
        floatingLabelText={props.floatingLabelText}
        value={props.matcher.source}
        onChange={(_e, v) => {
          props.onChange({
            ...props.matcher,
            source: v,
          });
        }}
      />
    </div>
  );
}
