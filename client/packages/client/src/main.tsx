import { ApolloProvider } from "@apollo/react-common";
import "core-js";
import * as OfflinePluginRuntime from "offline-plugin/runtime";
import * as React from "react";
import * as ReactDOM from "react-dom";
import * as Modal from "react-modal";
import { BrowserRouter } from "react-router-dom";
import { App } from "./components/app";
import { gqlClient } from "./utils";
import { Provider } from "react-redux";
import { configureStore } from "./domain";

Modal.setAppElement("#root");

// Installing ServiceWorker
OfflinePluginRuntime.install();

const store = configureStore();

ReactDOM.render(
  <ApolloProvider client={gqlClient}>
    <BrowserRouter>
      <Provider store={store}>
        <App />
      </Provider>
    </BrowserRouter>
  </ApolloProvider>,
  document.querySelector("#root"),
);
