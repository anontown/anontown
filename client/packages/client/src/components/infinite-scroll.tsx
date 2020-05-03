import { Scroll, ScrollRef } from "./scroll";
import * as React from "react";
import { RA, pipe, O, sleep, EqT } from "../prelude";
import { useLock } from "../hooks";

export interface InfiniteScrollProps<T> {
  itemToKey: (item: T) => string;
  renderItem: (item: T) => JSX.Element;
  style?: React.CSSProperties;
  className?: string;
  items: ReadonlyArray<T>;
  // keyがnullの時制御しない
  currentItemKey: string | null;
  // keyがnullの時アイテムが存在しない(itemsが0だったり、表示されているアイテムがなかったり)
  onChangeCurrentItemKey: (key: string | null) => void;
  onScrollTop: () => void;
  onScrollBottom: () => void;
  // 上のアイテムを現在のアイテムとするか、下のアイテムを現在のアイテムとするか
  currentItemBase: "top" | "bottom";
  // TODO: 自動スクロールに関すること
}

export function InfiniteScroll<T>(props: InfiniteScrollProps<T>) {
  const [currentItemKey, setCurrentItemKey] = React.useState<string | null>(
    null,
  );

  React.useEffect(() => {
    if (currentItemKey !== props.currentItemKey) {
      props.onChangeCurrentItemKey(currentItemKey);
    }
  }, [currentItemKey]);

  const scrollRef = React.useRef<ScrollRef<T> | null>(null);
  const lock = useLock();

  // アイテムに変更があったときスクロール位置固定
  const prevItemKeys = React.useRef<ReadonlyArray<string>>(
    props.items.map(item => props.itemToKey(item)),
  );
  React.useEffect(() => {
    const scroll = scrollRef.current;
    const itemKeys = props.items.map(item => props.itemToKey(item));
    if (
      scroll === null ||
      currentItemKey === null ||
      RA.getEq(EqT.eqString).equals(prevItemKeys.current, itemKeys)
    ) {
      return;
    }
    prevItemKeys.current = itemKeys;

    lock(async () => {
      const diff = scroll.getDiff(
        { ratio: 0 },
        // elementに存在するkeyでなければいけないのでcurrentItemKeyを使う
        { ratio: 0, key: currentItemKey },
      );
      if (O.isSome(diff)) {
        await sleep(0);
        scroll.setDiff(
          { ratio: 0 },
          { ratio: 0, key: currentItemKey },
          diff.value,
        );
      }
    });
  }, [props.items]);

  // propsのcurrentItemKeyが変わった時スクロール位置を変更する
  React.useEffect(() => {
    const scroll = scrollRef.current;
    if (scroll === null) {
      return;
    }

    const newCurrentItemKey = props.currentItemKey;

    if (newCurrentItemKey !== null && currentItemKey !== newCurrentItemKey) {
      lock(async () => {
        await sleep(0);
        switch (props.currentItemBase) {
          case "top": {
            scroll.setDiff(
              { ratio: 0 },
              { key: newCurrentItemKey, ratio: 0 },
              0,
            );
            break;
          }
          case "bottom": {
            scroll.setDiff(
              { ratio: 1 },
              { key: newCurrentItemKey, ratio: 1 },
              0,
            );
            break;
          }
        }
        setCurrentItemKey(newCurrentItemKey);
      });
    }
  }, [currentItemKey, props.currentItemKey]);

  const changeShowItems = React.useCallback(
    (items: ReadonlyArray<T>) => {
      switch (props.currentItemBase) {
        case "top": {
          setCurrentItemKey(
            pipe(RA.head(items), O.map(props.itemToKey), O.toNullable),
          );
          break;
        }
        case "bottom": {
          setCurrentItemKey(
            pipe(RA.last(items), O.map(props.itemToKey), O.toNullable),
          );
          break;
        }
      }
    },
    [props.currentItemBase, props.itemToKey],
  );

  const ScrollT = Scroll<T>();
  return (
    <ScrollT
      itemToKey={props.itemToKey}
      renderItem={props.renderItem}
      style={props.style}
      className={props.className}
      items={props.items}
      changeShowItems={changeShowItems}
      ref={scrollRef}
    />
  );
}
