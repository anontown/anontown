import * as React from "react";
import * as style from "./text-field.scss";

interface TextFieldProps {
  value: string;
  onChange: (v: string) => void;
  style?: React.CSSProperties;
  placeholder?: string;
  onFocus?: () => void;
  onBlur?: () => void;
}

export function TextField(props: TextFieldProps) {
  return (
    <input
      className={style.input}
      type="text"
      style={props.style}
      value={props.value}
      onChange={e => props.onChange(e.target.value)}
      placeholder={props.placeholder}
      onFocus={props.onFocus}
      onBlur={props.onBlur}
    />
  );
}
