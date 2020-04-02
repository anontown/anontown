import { graphql, buildSchema, introspectionQuery } from "graphql";
import * as fs from "fs-promise";

const schema = buildSchema(fs.readFileSync("../../schema.gql", "utf8"));
graphql(schema, introspectionQuery).then(result => {
  console.log(JSON.stringify(result));
});
