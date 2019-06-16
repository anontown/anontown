import { combineResolvers } from "apollo-resolvers";
import { ApolloServer, gql, IResolvers } from "apollo-server-express";
import * as cors from "cors";
import * as express from "express";
import * as fs from "fs-promise";
import {
  GraphQLDateTime,
} from "graphql-iso-date";
import { AtErrorSymbol, AtServerError } from "../at-error";
import { Config } from "../config";
import { IRepo } from "../models";
import { resolvers as appResolvers } from "../resolvers";
import { AppContext, createContext } from "./context";
import { createServer } from 'http';

export async function serverRun(repo: IRepo) {
  const typeDefs = gql(await fs.readFile("node_modules/@anontown/schema/app.gql", "utf8"));
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
    context: ({ req, connection }: any): Promise<AppContext> => {
      if (req) {
        return createContext(req.headers, repo);
      }

      if (connection) {
        return createContext(connection.context, repo);
      }

      return createContext({}, repo);
    },
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
    }
  });

  repo.cron();

  app.get("/ping", cors(), (_req, res) => res.send("OK"));
  server.applyMiddleware({ app, path: "/" });

  const httpServer = createServer(app);
  server.installSubscriptionHandlers(httpServer);

  httpServer.listen({ port: Config.server.port }, () => {
    console.log(`Server ready at ${server.graphqlPath}, ${server.subscriptionsPath}`);
  });
}
