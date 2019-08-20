import { ApolloProvider } from "@apollo/react-common";
import "core-js";
import * as OfflinePluginRuntime from "offline-plugin/runtime";
import * as React from "react";
import * as ReactDOM from "react-dom";
import * as Modal from "react-modal";
import { BrowserRouter } from "react-router-dom";
import { App } from "./components/app";
import { gqlClient } from "./utils";

Modal.setAppElement("#root");

// Installing ServiceWorker
OfflinePluginRuntime.install();

ReactDOM.render(
  <ApolloProvider client={gqlClient}>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </ApolloProvider>,
  document.querySelector("#root"),
);
