import { ApolloProvider } from "@apollo/react-common";
import "core-js";
import * as OfflinePluginRuntime from "offline-plugin/runtime";
import * as React from "react";
import * as ReactDOM from "react-dom";
import * as Modal from "react-modal";
import { App } from "./components/app";
import { gqlClient } from "./utils";
import { Provider } from "react-redux";
import { configureStore, history } from "./domain";
import { ConnectedRouter } from "connected-react-router";

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
