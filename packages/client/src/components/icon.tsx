import * as React from "react";
import { undefinedUnwrapOr } from "@kgtkr/utils";

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
      className={
        "material-icons" + " " + undefinedUnwrapOr("")(props.className)
      }
      style={{ userSelect: "none", ...props.style }}
    >
      {props.icon}
    </i>
  );
}
