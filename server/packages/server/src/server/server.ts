import { combineResolvers } from "apollo-resolvers";
import { ApolloServer, gql, IResolvers } from "apollo-server-express";
import cors from "cors";
import express from "express";
import { either } from "fp-ts";
import * as fs from "fs-promise";
import { GraphQLDateTime } from "graphql-iso-date";
import { createServer } from "http";
import * as t from "io-ts";
import { AtErrorSymbol, AtServerError } from "../at-error";
import { Config } from "../config";
import { resolvers as appResolvers } from "../resolvers";
import { runWorker } from "../worker";
import { AppContext, createContext } from "./context";

export async function serverRun() {
  const typeDefs = gql(await fs.readFile("../../schema.gql", "utf8"));
  const resolvers: IResolvers = combineResolvers([
    {
      DateTime: GraphQLDateTime,
    },
    appResolvers,
  ]);

  const app = express();

  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: (params: unknown): Promise<AppContext> => {
      const decodedParams = t.UnknownRecord.decode(params);
      if (either.isRight(decodedParams)) {
        const { req, connection } = decodedParams.right;
        const decodedReq = t.type({ headers: t.UnknownRecord }).decode(req);
        const decodeConnection = t
          .type({ context: t.UnknownRecord })
          .decode(connection);
        if (either.isRight(decodedReq)) {
          return createContext(decodedReq.right.headers);
        }

        if (either.isRight(decodeConnection)) {
          return createContext(decodeConnection.right.context);
        }
      }

      return createContext({});
    },
    plugins: [
      {
        requestDidStart: () => ({
          willSendResponse: response => {
            const ctx = (response.context as unknown) as AppContext;
            ctx.ports.resRepo.dispose();
          },
        }),
      },
    ],
    introspection: true,
    playground: {
      tabs: [
        {
          endpoint: "/",
          query: "",
          headers: {
            "X-Token": "",
          },
        },
      ],
    },
    debug: false,
    formatError: (error: any) => {
      console.log(error);
      if (error.extensions.exception[AtErrorSymbol]) {
        return error.extensions.exception.data;
      } else {
        return new AtServerError().data;
      }
    },
    subscriptions: {
      path: "/",
    },
  });

  runWorker();

  app.get("/ping", cors(), (_req, res) => res.send("OK"));
  server.applyMiddleware({ app, path: "/" });

  const httpServer = createServer(app);
  server.installSubscriptionHandlers(httpServer);

  httpServer.listen({ port: Config.server.port }, () => {
    console.log(
      `Server ready at ${server.graphqlPath}, ${
        server.subscriptionsPath ?? "<unknown subscriptionsPath>"
      }`,
    );
  });
}
