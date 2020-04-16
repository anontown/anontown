import { Client, IndicesCreateParams } from "elasticsearch";
import { ESClient } from "../db";

export async function createIndex(
  client: Client,
  params: IndicesCreateParams,
): Promise<void> {
  if (!(await client.indices.exists({ index: params.index }))) {
    await client.indices.create(params);
  }
}

export async function reindex(
  alias: string,
  from: string,
  params: IndicesCreateParams,
) {
  const to = params.index;
  await createIndex(ESClient(), params);

  await ESClient().reindex({
    body: {
      source: {
        index: from,
      },
      dest: {
        index: to,
      },
    },
  });

  await ESClient().indices.updateAliases({
    body: {
      actions: [
        { remove: { index: from, alias } },
        { add: { index: to, alias } },
      ],
    },
  });
}
