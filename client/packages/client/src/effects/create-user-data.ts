import * as G from "../generated/graphql";
import { UserData } from "../domains/entities";
import { createHeaders, gqlClient } from "./gql-client";
import * as storageAPI from "./storage-api";

export async function createUserData(
  token: G.TokenMasterFragment,
): Promise<UserData> {
  const storage = await storageAPI.load(token);
  const user = await gqlClient.query<G.FindUserQuery, G.FindUserQueryVariables>(
    {
      query: G.FindUserDocument,
      variables: {},
      context: {
        headers: createHeaders(token.id, token.key),
      },
    },
  );

  return { storage, token, id: user.data.user.id };
}
