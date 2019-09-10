import { ITopicAPI } from "../entities";
import { PortPick } from "../ports";

/*
指定されたidのtopicを取得する

## 事前条件
* 指定されたidを持つtopicが存在する

## 引数
* `id`: 取得するtopicのid

## 返り値
* ITopicAPI

## エラー
なし
*/
export async function getTopic(
  { id }: { id: string },
  { topicLoader }: PortPick<"topicLoader">,
): Promise<ITopicAPI> {
  const topic = await topicLoader.load(id);
  return topic.toAPI();
}
