import { IProfileAPI } from "../entities";
import { PortPick } from "../ports";

/*
指定されたidのprofileを取得する

## 事前条件
* 指定されたidを持つprofileが存在する

## 引数
* `id`: 取得するprofileのid

## 返り値
* IProfileAPI

## エラー
なし
*/
export async function getProfile(
  { id }: { id: string },
  { profileLoader, authContainer }: PortPick<"profileLoader" | "authContainer">,
): Promise<IProfileAPI> {
  const profile = await profileLoader.load(id);
  return profile.toAPI(authContainer.getTokenOrNull());
}
