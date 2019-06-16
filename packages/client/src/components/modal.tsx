import * as React from "react";
import * as ReactModal from "react-modal";

export const Modal = (
  props: ReactModal.Props & { children?: React.ReactNode },
) => {
  return (
    <ReactModal
      {...props}
      style={{
        ...props.style,
        content: {
          top: "10vh",
          maxHeight: "70vh",
          bottom: "auto",
        },
      }}
    />
  );
};
