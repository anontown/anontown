import * as G from "../generated/graphql";
import { Storage, Sto } from "../domains/entities";
import { createHeaders, gqlClient } from "../effects";

export async function load(token: G.TokenMasterFragment) {
  const storages = await gqlClient.query<
    G.FindStoragesQuery,
    G.FindStoragesQueryVariables
  >({
    query: G.FindStoragesDocument,
    variables: { query: {} },
    context: {
      headers: createHeaders(token.id, token.key),
    },
  });
  const key = [...Sto.verArray, "main"].find(
    ver => storages.data.storages.findIndex(x => x.key === ver) !== -1,
  );
  const sto = storages.data.storages.find(x => x.key === key);
  return Sto.toStorage(
    await Sto.convert(
      sto !== undefined ? JSON.parse(sto.value) : Sto.initStorage,
    ),
  );
}

export function useSave() {
  const [submit] = G.useSetStorageMutation();
  return (storage: Storage) => {
    const json = Sto.toJSON(storage);
    return submit({
      variables: {
        key: json.ver,
        value: JSON.stringify(json),
      },
    });
  };
}
