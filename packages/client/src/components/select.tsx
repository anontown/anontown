import * as React from "react";
import * as style from "./select.scss";

interface SelectProps {
  value: string;
  options: Array<{ value: string, text: string }>;
  style?: React.CSSProperties;
  onChange: (v: string) => void;
}

export function Select(props: SelectProps) {
  return (
    <select
      style={props.style}
      className={style.select}
      value={props.value}
      onChange={e => {
        props.onChange(e.target.value);
      }}
    >
      {props.options.map(x => <option value={x.value} key={x.value}>{x.text}</option>)}
    </select>
  );
}
