import { PortPick } from "../ports";
import { IResAPI } from "../entities";

/*
指定されたidのresを取得する

## 事前条件
* 指定されたidを持つresが存在する

## 引数
* `id`: 取得するresのid

## 返り値
* IResAPI
  * 共通
    * self: 認証していなければnull。自分の書き込みかどうか
    * voteFlag: 認証していなければnull。投票状況
  * normal
    * isReply: 認証していないもしくはリプ先がない時null。自分に対するリプライかどうか
  * delete
    * normalかつdeleteFlagがactiveでない時


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
