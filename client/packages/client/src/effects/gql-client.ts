import {
  InMemoryCache,
  IntrospectionFragmentMatcher,
} from "apollo-cache-inmemory";
import { ApolloClient } from "apollo-client";
import { ApolloLink, Operation, split } from "apollo-link";
import { onError } from "apollo-link-error";
import { HttpLink } from "apollo-link-http";
import { WebSocketLink } from "apollo-link-ws";
import { getMainDefinition } from "apollo-utilities";
import * as zen from "zen-observable-ts";
import { Env } from "../env";
import introspectionResult from "../generated/introspection-result";
import { auth } from "../utils";

export function createHeaders(id: string, key: string): {} {
  return {
    "X-Token": `${id},${key}`,
  };
}

const httpLink = new HttpLink({
  uri: Env.api.origin,
  credentials: "same-origin",
});

const wsLink = new WebSocketLink({
  uri: Env.socket.origin + "/",
  options: {
    reconnect: true,
    lazy: true,
    connectionParams: () =>
      auth !== null ? createHeaders(auth.id, auth.key) : {},
  },
});

const request = (opt: Operation) => {
  if (auth !== null) {
    opt.setContext({
      headers: createHeaders(auth.id, auth.key),
    });
  }
};

const requestLink = new ApolloLink(
  (operation, forward) =>
    new zen.Observable(observer => {
      let handle: zen.ZenObservable.Subscription | undefined;
      Promise.resolve(request(operation))
        .then(() => {
          handle = forward(operation).subscribe({
            next: observer.next.bind(observer),
            error: observer.error.bind(observer),
            complete: observer.complete.bind(observer),
          });
        })
        .catch(observer.error.bind(observer));

      return () => {
        if (handle) {
          handle.unsubscribe();
        }
      };
    }),
);

const fragmentMatcher = new IntrospectionFragmentMatcher({
  introspectionQueryResultData: introspectionResult,
});

export const gqlClient = new ApolloClient({
  link: ApolloLink.from([
    onError(({ graphQLErrors, networkError }) => {
      if (graphQLErrors) {
        graphQLErrors.map(({ message, locations, path }) =>
          console.log(
            `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`,
          ),
        );
      }
      if (networkError) {
        console.log("[Network error]", networkError);
      }
    }),
    requestLink,
    split(
      ({ query }) => {
        const definition = getMainDefinition(query);
        return (
          definition.kind === "OperationDefinition" &&
          definition.operation === "subscription"
        );
      },
      wsLink,
      httpLink,
    ),
  ]),
  cache: new InMemoryCache({
    fragmentMatcher,
  }),
});
