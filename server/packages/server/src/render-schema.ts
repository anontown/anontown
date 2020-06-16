import * as fs from "fs-promise";
import { buildSchema, graphql, introspectionQuery } from "graphql";

const schema = buildSchema(fs.readFileSync("../../schema.gql", "utf8"));

// eslint-disable-next-line @typescript-eslint/no-floating-promises
graphql(schema, introspectionQuery).then(result => {
  console.log(JSON.stringify(result));
});
