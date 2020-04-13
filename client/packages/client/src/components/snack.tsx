import { Snackbar } from "material-ui";
import * as React from "react";

export function Snack(props: { msg: string | null; onHide?: () => void }) {
  return (
    <Snackbar
      open={props.msg !== null}
      message={props.msg ?? ""}
      autoHideDuration={5000}
      onRequestClose={() => {
        props.onHide?.();
      }}
    />
  );
}
