import { FontIcon } from "material-ui";
import * as React from "react";

export interface ErrorsProps {
  errors?: string[];
}

export const Errors = (props: ErrorsProps) => (
  <div>
    {props.errors
      ? props.errors.map((e, i) => (
          <div key={i.toString()}>
            <FontIcon className="material-icons">error</FontIcon> {e}
          </div>
        ))
      : null}
  </div>
);
