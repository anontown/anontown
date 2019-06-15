import * as G from "../../generated/graphql";
import {
  convert,
  initStorage,
  Storage,
  StorageJSON,
  toJSON,
  toStorage,
  verArray,
} from "../models";
import { createHeaders, gqlClient } from "../utils";

export async function load(token: G.TokenMasterFragment) {
  const storages = await gqlClient.query<G.FindStoragesQuery, G.FindStoragesQueryVariables>({
    query: G.FindStoragesDocument,
    variables: { query: {} },
    context: {
      headers: createHeaders(token.id, token.key),
    },
  });
  const key = [...verArray, "main"].find(ver => storages.data.storages.findIndex(x => x.key === ver) !== -1);
  const sto = storages.data.storages.find(x => x.key === key);
  return toStorage(await convert(sto !== undefined
    ? JSON.parse(sto.value)
    : initStorage));
}

export function useSave() {
  const submit = G.useSetStorageMutation();
  return (storage: Storage) => {
    const json = toJSON(storage);
    return submit({
      variables: {
        key: json.ver,
        value: JSON.stringify(json),
      },
    });
  };
}
