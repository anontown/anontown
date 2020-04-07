import * as fs from "fs-promise";
import { buildSchema, graphql, introspectionQuery } from "graphql";

const schema = buildSchema(fs.readFileSync("../../schema.gql", "utf8"));

// tslint:disable-next-line:no-floating-promises
graphql(schema, introspectionQuery).then(result => {
  console.log(JSON.stringify(result));
});
