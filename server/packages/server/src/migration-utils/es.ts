import { IndicesCreateParams, Client } from "elasticsearch";

export async function createIndex(
  client: Client,
  params: IndicesCreateParams,
): Promise<void> {
  if (!(await client.indices.exists({ index: params.index }))) {
    await client.indices.create(params);
  }
}
