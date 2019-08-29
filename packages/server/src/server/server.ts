import { combineResolvers } from "apollo-resolvers";
import { ApolloServer, gql, IResolvers } from "apollo-server-express";
import * as cors from "cors";
import * as express from "express";
import * as fs from "fs-promise";
import { GraphQLDateTime } from "graphql-iso-date";
import { createServer } from "http";
import { Logger } from "../adapters/index";
import { Repo } from "../adapters/repo";
import { AtErrorSymbol, AtServerError } from "../at-error";
import { Config } from "../config";
import { resolvers as appResolvers } from "../resolvers";
import { AppContext, createContext } from "./context";

export async function serverRun() {
  const typeDefs = gql(
    await fs.readFile(require.resolve("@anontown/schema/app.gql"), "utf8"),
  );
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
        return createContext(req.headers);
      }

      if (connection) {
        return createContext(connection.context);
      }

      return createContext({});
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
    },
  });

  // TODO: 綺麗にする
  new Repo(new Logger()).cron();

  app.get("/ping", cors(), (_req, res) => res.send("OK"));
  server.applyMiddleware({ app, path: "/" });

  const httpServer = createServer(app);
  server.installSubscriptionHandlers(httpServer);

  httpServer.listen({ port: Config.server.port }, () => {
    console.log(
      `Server ready at ${server.graphqlPath}, ${server.subscriptionsPath}`,
    );
  });
}
