import * as React from "react";
import TextareaAutosize from "react-autosize-textarea";
import * as style from "./text-area.scss";

interface TextAreaProps {
  value: string;
  onChange: (v: string) => void;
  style?: React.CSSProperties;
  placeholder?: string;
  rows?: number;
  rowsMax?: number;
  onKeyDown?: React.KeyboardEventHandler<{}>;
  onKeyUp?: React.KeyboardEventHandler<{}>;
  onKeyPress?: React.KeyboardEventHandler<{}>;
  onFocus?: () => void;
  onBlur?: () => void;
}

export function TextArea(props: TextAreaProps) {
  return (
    <TextareaAutosize
      className={style.textarea}
      style={props.style}
      value={props.value}
      onChange={(e: any) => props.onChange(e.target.value)}
      placeholder={props.placeholder}
      onKeyDown={props.onKeyDown}
      onKeyUp={props.onKeyUp}
      onKeyPress={props.onKeyPress}
      rows={props.rows}
      maxRows={props.rowsMax}
      onFocus={props.onFocus}
      onBlur={props.onBlur}
    />
  );
}
