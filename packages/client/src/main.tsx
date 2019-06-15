import "core-js";
import * as OfflinePluginRuntime from "offline-plugin/runtime";
import * as React from "react";
import { ApolloProvider } from "react-apollo";
import { ApolloProvider as ApolloHooksProvider } from "react-apollo-hooks";
import * as ReactDOM from "react-dom";
import * as Modal from "react-modal";
import { BrowserRouter, Route, Switch } from "react-router-dom";
import { App } from "./components/app";
import { gqlClient } from "./utils";


Modal.setAppElement("#root");

// Installing ServiceWorker
OfflinePluginRuntime.install();

ReactDOM.render(
  <ApolloProvider client={gqlClient}>
    <ApolloHooksProvider client={gqlClient}>
      <BrowserRouter>
        <Switch>
          <Route path="/" component={App} />
        </Switch>
      </BrowserRouter>
    </ApolloHooksProvider>
  </ApolloProvider>,
  document.querySelector("#root"),
);
