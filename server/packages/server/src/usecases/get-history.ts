import { IHistoryAPI } from "../entities";
import { PortPick } from "../ports";

/*
指定されたidのhistoryを取得する

## 事前条件
* 指定されたidを持つhistoryが存在する

## 引数
* `id`: 取得するhistoryのid

## 返り値
* IHistoryAPI

## エラー
なし
*/
export async function getHistory(
  { id }: { id: string },
  { historyLoader, authContainer }: PortPick<"historyLoader" | "authContainer">,
): Promise<IHistoryAPI> {
  const history = await historyLoader.load(id);
  return history.toAPI(authContainer.getTokenOrNull());
}
