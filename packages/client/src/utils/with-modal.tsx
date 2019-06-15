import * as React from "react";
import {
  RouteComponentProps,
  withRouter,
} from "react-router-dom";
import { Modal } from "../components";

export const withModal = <P extends {}>(Page: React.ComponentType<P>, title: string) => {
  return withRouter((props: P & RouteComponentProps<{}>) => {
    const goBack = React.useMemo(() => () => {
      props.history.goBack();
    }, [props.history]);

    return (
      <Modal
        isOpen={true}
        onRequestClose={goBack}
      >
        <h1>{title}</h1>
        {React.createElement(Page, props)}
      </Modal>
    );
  });
};
