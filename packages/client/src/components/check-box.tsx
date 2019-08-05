import * as React from "react";
import * as style from "./check-box.scss";

interface CheckBoxProps {
  value: boolean;
  style?: React.CSSProperties;
  labelStyle?: React.CSSProperties;
  checkBoxStyle?: React.CSSProperties;
  onChange: (v: boolean) => void;
  label: string;
  onFocus?: () => void;
  onBlur?: () => void;
}

export function CheckBox(props: CheckBoxProps) {
  return (
    <label className={style.comp} style={props.style}>
      <input
        type="checkbox"
        checked={props.value}
        style={props.checkBoxStyle}
        className={style.checkbox}
        onChange={e => props.onChange(e.target.checked)}
        onFocus={props.onFocus}
        onBlur={props.onBlur}
      />
      <span style={props.labelStyle} className={style.label}>
        {props.label}
      </span>
    </label>
  );
}
