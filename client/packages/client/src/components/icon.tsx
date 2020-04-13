import * as React from "react";

interface IconProps {
  icon: string;
}

export function Icon(
  props: IconProps &
    React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>,
) {
  return (
    <i
      {...{ ...props, icon: undefined }}
      className={"material-icons" + " " + (props.className ?? "")}
      style={{ userSelect: "none", ...props.style }}
    >
      {props.icon}
    </i>
  );
}
