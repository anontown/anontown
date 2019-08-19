import * as React from "react";
import { Modal } from "../components";
import useRouter from "use-react-router";

export const withModal = <P extends {}>(
  Page: React.ComponentType<P>,
  title: string,
) => {
  return (props: P) => {
    const { history } = useRouter();
    const goBack = React.useMemo(
      () => () => {
        history.goBack();
      },
      [history],
    );

    return (
      <Modal isOpen={true} onRequestClose={goBack}>
        <h1>{title}</h1>
        {React.createElement(Page, props)}
      </Modal>
    );
  };
};
