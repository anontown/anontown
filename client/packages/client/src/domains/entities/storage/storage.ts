import * as Im from "immutable";
import * as N from "../ng";
import { StorageJSONLatest } from "./storage-json";
export * from "./storage-json";
import { Newtype, iso } from "newtype-ts";
import { list } from "../../../utils";
import { Option } from "fp-ts/lib/Option";
import { pipe, O } from "../../../prelude";
import { Lens } from "monocle-ts";

interface TopicWriteA {
  name: string;
  profile: string | null;
  text: string;
  replyText: Im.Map<string, string>;
  age: boolean;
}

export interface TopicWrite
  extends Newtype<{ readonly TopicWrite: unique symbol }, TopicWriteA> {}

const isoTopicWrite = iso<TopicWrite>();

const initTopicWrite = isoTopicWrite.wrap({
  name: "",
  profile: null,
  text: "",
  replyText: Im.Map<string, string>(),
  age: true,
});

export function topicWriteSetText(reply: string | null, text: string) {
  return isoTopicWrite.modify(topicWrite => {
    if (reply === null) {
      return {
        ...topicWrite,
        text,
      };
    } else {
      return {
        ...topicWrite,
        replyText: topicWrite.replyText.set(reply, text),
      };
    }
  });
}

export function topicWriteGetText(reply: string | null) {
  return (topicWrite: TopicWrite): string => {
    if (reply === null) {
      return isoTopicWrite.unwrap(topicWrite).text;
    } else {
      return isoTopicWrite.unwrap(topicWrite).replyText.get(reply, "");
    }
  };
}

export function topicWriteSetName(name: string) {
  return isoTopicWrite.modify(topicWrite => ({ ...topicWrite, name }));
}

export function topicWriteGetName(topicWrite: TopicWrite): string {
  return isoTopicWrite.get(topicWrite).name;
}

export function topicWriteSetProfile(profile: string | null) {
  return isoTopicWrite.modify(topicWrite => ({ ...topicWrite, profile }));
}

export function topicWriteGetProfile(topicWrite: TopicWrite): string | null {
  return isoTopicWrite.get(topicWrite).profile;
}

export function topicWriteSetAge(age: boolean) {
  return isoTopicWrite.modify(topicWrite => ({ ...topicWrite, age }));
}

export function topicWriteGetAge(topicWrite: TopicWrite): boolean {
  return isoTopicWrite.get(topicWrite).age;
}

interface TopicReadA {
  date: string;
  count: number;
}

export interface TopicRead
  extends Newtype<{ readonly TopicRead: unique symbol }, TopicReadA> {}

const isoTopicRead = iso<TopicRead>();

export const topicReadDateLens: Lens<TopicRead, string> = new Lens(
  topicRead => isoTopicRead.unwrap(topicRead).date,
  date => isoTopicRead.modify(topicRead => ({ ...topicRead, date })),
);

export const topicReadCountLens: Lens<TopicRead, number> = new Lens(
  topicRead => isoTopicRead.unwrap(topicRead).count,
  count => isoTopicRead.modify(topicRead => ({ ...topicRead, count })),
);

interface StorageA {
  readonly topicFavo: Im.Set<string>;
  readonly tagsFavo: Im.Set<Im.Set<string>>;
  readonly topicRead: Im.Map<string, TopicReadA>;
  readonly topicWrite: Im.Map<string, TopicWriteA>;
  readonly ng: Im.List<N.NG>;
}

export interface Storage
  extends Newtype<{ readonly Storage: unique symbol }, StorageA> {}

const isoStorage = iso<Storage>();

export function getTagsFavo(
  storage: Storage,
): ReadonlyArray<ReadonlyArray<string>> {
  const { tagsFavo } = isoStorage.unwrap(storage);
  return tagsFavo.toArray().map(x => x.toArray());
}

export function getTopicFavo(storage: Storage): ReadonlyArray<string> {
  const { topicFavo } = isoStorage.unwrap(storage);
  return topicFavo.toArray();
}

export function addNG(ng: N.NG) {
  return isoStorage.modify(storage => ({
    ...storage,
    ng: storage.ng.insert(0, ng),
  }));
}

export function getNG(storage: Storage): ReadonlyArray<N.NG> {
  const { ng } = isoStorage.unwrap(storage);
  return ng.toArray();
}

export function removeNG(id: string) {
  return isoStorage.modify(storage => ({
    ...storage,
    ng: storage.ng.filter(x => x.id !== id),
  }));
}

export function updateNG(ng: N.NG) {
  return isoStorage.modify(storage => ({
    ...storage,
    ng: list.updateIm(storage.ng, ng),
  }));
}

export function getTopicRead(id: string) {
  return (storage: Storage): Option<TopicRead> => {
    return pipe(
      isoStorage.unwrap(storage).topicRead.get(id),
      O.fromNullable,
      O.map(isoTopicRead.wrap),
    );
  };
}

export function setTopicRead(id: string, value: TopicRead) {
  return isoStorage.modify(storage => ({
    ...storage,
    topicRead: storage.topicRead.set(id, isoTopicRead.unwrap(value)),
  }));
}

export function makeTopicRead(data: {
  date: string;
  count: number;
}): TopicRead {
  return isoTopicRead.wrap(data);
}

export function modifyTopicRead(
  id: string,
  f: (value: Option<TopicRead>) => TopicRead,
) {
  return (storage: Storage): Storage => {
    return setTopicRead(id, f(getTopicRead(id)(storage)))(storage);
  };
}

export function getTopicWrite(id: string) {
  return (storage: Storage): TopicWrite => {
    return pipe(
      isoStorage.unwrap(storage).topicWrite.get(id),
      O.fromNullable,
      O.map(isoTopicWrite.wrap),
      O.getOrElse(() => initTopicWrite),
    );
  };
}

export function setTopicWrite(id: string, value: TopicWrite) {
  return isoStorage.modify(storage => ({
    ...storage,
    topicWrite: storage.topicWrite.set(id, isoTopicWrite.unwrap(value)),
  }));
}

export function modifyTopicWrite(
  id: string,
  f: (value: TopicWrite) => TopicWrite,
) {
  return (storage: Storage): Storage => {
    return setTopicWrite(id, f(getTopicWrite(id)(storage)))(storage);
  };
}

export function isTopicFavo(id: string) {
  return (storage: Storage): boolean => {
    return isoStorage.unwrap(storage).topicFavo.has(id);
  };
}

export function favoTopic(id: string) {
  return isoStorage.modify(storage => ({
    ...storage,
    topicFavo: storage.topicFavo.add(id),
  }));
}

export function unfavoTopic(id: string) {
  return isoStorage.modify(storage => ({
    ...storage,
    topicFavo: storage.topicFavo.delete(id),
  }));
}

export function isTagsFavo(tags: ReadonlyArray<string>) {
  return (storage: Storage): boolean => {
    return isoStorage.unwrap(storage).tagsFavo.has(Im.Set(tags));
  };
}

export function favoTags(tags: ReadonlyArray<string>) {
  return isoStorage.modify(storage => ({
    ...storage,
    tagsFavo: storage.tagsFavo.add(Im.Set(tags)),
  }));
}

export function unfavoTags(tags: ReadonlyArray<string>) {
  return isoStorage.modify(storage => ({
    ...storage,
    tagsFavo: storage.tagsFavo.delete(Im.Set(tags)),
  }));
}

export function toStorage(json: StorageJSONLatest): Storage {
  return isoStorage.wrap({
    topicFavo: Im.Set(json.topicFavo),
    tagsFavo: Im.Set(json.tagsFavo.map(tags => Im.Set(tags))),
    topicRead: Im.Map(json.topicRead),
    topicWrite: Im.Map(json.topicWrite).map(x => ({
      ...x,
      replyText: Im.Map(x.replyText),
    })),
    ng: Im.List(json.ng.map(x => N.fromJSON(x))),
  });
}

export function toJSON(storage: Storage): StorageJSONLatest {
  const { topicFavo, tagsFavo, topicRead, topicWrite, ng } = isoStorage.unwrap(
    storage,
  );
  return {
    ver: "9",
    topicFavo: topicFavo.toArray(),
    tagsFavo: tagsFavo.map(tags => tags.toArray()).toArray(),
    topicRead: topicRead.toObject(),
    topicWrite: topicWrite
      .map(x => ({ ...x, replyText: x.replyText.toObject() }))
      .toObject(),
    ng: ng.map(x => N.toJSON(x)).toArray(),
  };
}
