import { IResAPI } from "../entities";
import { PortPick } from "../ports";

/*
指定されたidのresを取得する

## 事前条件
* 指定されたidを持つresが存在する

## 引数
* `id`: 取得するresのid

## 返り値
* IResAPI

## エラー
なし
*/
export async function getRes(
  { id }: { id: string },
  { resLoader, authContainer }: PortPick<"resLoader" | "authContainer">,
): Promise<IResAPI> {
  const res = await resLoader.load(id);
  return res.toAPI(authContainer.getTokenOrNull());
}
