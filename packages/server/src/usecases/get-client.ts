import { IClientAPI } from "../entities";
import { PortPick } from "../ports";

/*
指定されたidのclientを取得する

## 事前条件
* 指定されたidを持つclientが存在する

## 引数
* `id`: 取得するclientのid

## 返り値
* IClientAPI

## エラー
なし
*/
export async function getClient(
  { id }: { id: string },
  { clientLoader, authContainer }: PortPick<"clientLoader" | "authContainer">,
): Promise<IClientAPI> {
  const client = await clientLoader.load(id);
  return client.toAPI(authContainer.getTokenMasterOrNull());
}
