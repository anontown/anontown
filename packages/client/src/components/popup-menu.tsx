import * as React from "react";
import Popup from "reactjs-popup";

export interface PopupMenuProps {
  trigger: JSX.Element;
  children?: React.ReactNode;
}

export function PopupMenu(props: PopupMenuProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  return (
    <Popup
      trigger={props.trigger}
      open={isOpen}
      arrow={false}
      onClose={() => setIsOpen(false)}
      onOpen={() => setIsOpen(true)}
    >
      <div onClick={() => setIsOpen(false)}>{props.children}</div>
    </Popup>
  );
}
