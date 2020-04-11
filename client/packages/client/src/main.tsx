import { ApolloProvider } from "@apollo/react-common";
import { ConnectedRouter } from "connected-react-router";
import "core-js";
import * as OfflinePluginRuntime from "offline-plugin/runtime";
import * as React from "react";
import * as ReactDOM from "react-dom";
import Modal from "react-modal";
import { Provider } from "react-redux";
import { App } from "./components/app";
import { configureStore, history } from "./domain";
import { gqlClient } from "./utils";

Modal.setAppElement("#root");

// Installing ServiceWorker
OfflinePluginRuntime.install();

const store = configureStore();

ReactDOM.render(
  <ApolloProvider client={gqlClient}>
    <Provider store={store}>
      <ConnectedRouter history={history}>
        <App />
      </ConnectedRouter>
    </Provider>
  </ApolloProvider>,
  document.querySelector("#root"),
);
