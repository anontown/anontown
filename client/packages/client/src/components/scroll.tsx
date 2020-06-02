import * as React from "react";
import { O, Option } from "../prelude";
import { useFunctionRef } from "../hooks";

export interface ScrollRef<_T> {
  /**
   * containerとitemsのセレクタで指定された2点の位置差がdiffになるようにスクロール位置を調整する
   */
  setDiff: (
    containerPositionSelector: ContainerPositionSelector,
    itemsPositionSelector: ItemsPositionSelector,
    diff: number,
  ) => Option<null>;

  /**
   * containerとitemsのセレクタで指定された2点の位置差を返す
   * containerのセレクタの点が上なら正の値を、下なら負の値を返す
   * containerかitemsのElementが存在しなければNoneを返す
   */
  getDiff: (
    containerPositionSelector: ContainerPositionSelector,
    itemsPositionSelector: ItemsPositionSelector,
  ) => Option<number>;

  modifyScrollTop(
    f: (_: { scrollTop: number; scrollHeight: number }) => number,
  ): void;
}

// itemToKeyは変化してはいけない
function useKeyToElementMap<T>({
  itemToKey,
  items,
  onSet,
  onDelete,
}: {
  itemToKey: (item: T) => string;
  items: ReadonlyArray<T>;
  onSet: (
    key: string,
    prev: HTMLDivElement | undefined,
    el: HTMLDivElement,
  ) => void;
  onDelete: (key: string, el: HTMLDivElement) => void;
}): [Map<string, HTMLDivElement>, (item: T, element: HTMLDivElement) => void] {
  const keyToElementMap = React.useMemo(
    () => new Map<string, HTMLDivElement>(),
    [],
  );
  React.useEffect(() => {
    const activeKeys = new Set(items.map(item => itemToKey(item)));
    for (const [key, el] of Array.from(keyToElementMap.entries())) {
      if (!activeKeys.has(key)) {
        keyToElementMap.delete(key);
        onDelete(key, el);
      }
    }
  }, [items]);

  const setElement = React.useCallback((item: T, element: HTMLDivElement) => {
    const key = itemToKey(item);
    const prev = keyToElementMap.get(key);
    keyToElementMap.set(key, element);
    onSet(key, prev, element);
  }, []);

  return [keyToElementMap, setElement];
}

/*
スクロール位置の指定方法
アイテムの追加・サイズ変更、コンテナーのサイズ変更に依存しない値
サイズは割合指定なら依存しなさそう(上は0、下はみたいな)
コンテナの位置(0-1)とアイテムのidと位置(0-1)の間1のピクセル数を指定する形式がよさそう
*/

/**
 * コンテナのある一点を表すセレクタ
 */
export interface ContainerPositionSelector {
  /**
   * コンテナの一番上を0、一番下を1とした時の位置
   */
  ratio: number;
}

/**
 * アイテムリストのある一点を表すセレクタ
 */
export interface ItemsPositionSelector {
  key: string;

  /**
   * keyで指定されたアイテムの一番上を0、一番下を1とした時の位置
   */
  ratio: number;
}

export interface ScrollProps<T> {
  itemToKey: (item: T) => string;
  renderItem: (item: T) => JSX.Element;
  changeShowItems: (items: ReadonlyArray<T>) => void;
  style?: React.CSSProperties;
  className?: string;
  items: ReadonlyArray<T>;
}

/*
細かい調整が可能なスクロールコンポーネント
DOMに触らずに操作が可能だがrefを使っているので宣言的には書けない
*/
function _Scroll<T>() {
  return React.forwardRef(
    (props: ScrollProps<T>, ref: React.Ref<ScrollRef<T>>) => {
      const containerElementRef = React.useRef<HTMLDivElement | null>(null);
      const [keyToElementMap, setElement] = useKeyToElementMap<T>({
        itemToKey: props.itemToKey,
        items: props.items,
        onSet: (_key, prev, el) => {
          if (intersectionObserverRef.current !== null) {
            if (prev !== undefined) {
              intersectionObserverRef.current.unobserve(prev);
            }
            intersectionObserverRef.current.observe(el);
          }
        },
        onDelete: (_key, el) => {
          if (intersectionObserverRef.current !== null) {
            intersectionObserverRef.current.unobserve(el);
          }
        },
      });

      const showKeys = React.useMemo(() => new Set<string>(), []);

      const intersectionObserverRef = React.useRef<IntersectionObserver | null>(
        null,
      );

      const intersectionObserverCallback = useFunctionRef(
        (entries: Array<IntersectionObserverEntry>) => {
          for (const entry of entries) {
            const key = (entry.target as HTMLDivElement).dataset.key!;
            if (entry.isIntersecting) {
              showKeys.add(key);
            } else {
              showKeys.delete(key);
            }
          }
          props.changeShowItems(
            props.items.filter(item => showKeys.has(props.itemToKey(item))),
          );
        },
      );

      React.useEffect(() => {
        if (intersectionObserverRef.current !== null) {
          intersectionObserverRef.current.disconnect();
        }

        if (containerElementRef.current !== null) {
          intersectionObserverRef.current = new IntersectionObserver(
            intersectionObserverCallback,
            {
              root: containerElementRef.current,
            },
          );
          for (const el of Array.from(keyToElementMap.values())) {
            intersectionObserverRef.current.observe(el);
          }
        }
      }, [containerElementRef.current]);

      const getDiff = React.useCallback(
        (
          containerPositionSelector: ContainerPositionSelector,
          itemsPositionSelector: ItemsPositionSelector,
        ): Option<number> => {
          const containerElement = containerElementRef.current;
          const itemElement = keyToElementMap.get(itemsPositionSelector.key);
          if (containerElement === null || itemElement === undefined) {
            return O.none;
          }

          // コンテナの上を基準とした時のセレクタで指定されたコンテナ座標
          const containerPosition =
            containerElement.clientHeight * containerPositionSelector.ratio;

          // コンテナの上を基準とした時のセレクタで指定されたアイテム座標
          const itemPosition =
            itemElement.getBoundingClientRect().y -
            containerElement.getBoundingClientRect().y +
            itemElement.clientHeight * itemsPositionSelector.ratio;

          return O.some(itemPosition - containerPosition);
        },
        [],
      );

      const setDiff = React.useCallback(
        (
          containerPositionSelector: ContainerPositionSelector,
          itemsPositionSelector: ItemsPositionSelector,
          diff: number,
        ): Option<null> => {
          const curDiff = getDiff(
            containerPositionSelector,
            itemsPositionSelector,
          );

          const containerElement = containerElementRef.current;
          if (containerElement === null || O.isNone(curDiff)) {
            return O.none;
          }

          containerElement.scrollTop += curDiff.value - diff;
          return O.some(null);
        },
        [],
      );

      const modifyScrollTop = React.useCallback(
        (f: (_: { scrollTop: number; scrollHeight: number }) => number) => {
          if (containerElementRef.current !== null) {
            containerElementRef.current.scrollTop = f({
              scrollTop: containerElementRef.current.scrollTop,
              scrollHeight: containerElementRef.current.scrollHeight,
            });
          }
        },
        [],
      );

      React.useImperativeHandle(
        ref,
        () => ({
          setDiff,
          getDiff,
          modifyScrollTop,
        }),
        [setDiff, getDiff, modifyScrollTop],
      );

      return (
        <div
          className={props.className}
          style={props.style}
          ref={containerElementRef}
        >
          {props.items.map(item => (
            <div
              key={props.itemToKey(item)}
              data-key={props.itemToKey(item)}
              ref={el => {
                if (el !== null) {
                  setElement(item, el);
                }
              }}
            >
              {props.renderItem(item)}
            </div>
          ))}
        </div>
      );
    },
  );
}

const _scroll = _Scroll<any>();

export function Scroll<T>(): React.ForwardRefExoticComponent<
  ScrollProps<T> & React.RefAttributes<ScrollRef<T>>
> {
  // 常に同じコンポーネントの参照を返したいので
  return _scroll;
}
