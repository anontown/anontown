import * as React from "react";
import * as rx from "rxjs";
import * as op from "rxjs/operators";
import { O, Option } from "../prelude";
import { useValueRef } from "../hooks";

// itemToKeyは変化してはいけない
function useKeyToElementMap<T>(
  itemToKey: (item: T) => string,
  items: ReadonlyArray<T>,
): [Map<string, HTMLDivElement>, (item: T, element: HTMLDivElement) => void] {
  const keyToElementMap = React.useMemo(
    () => new Map<string, HTMLDivElement>(),
    [],
  );
  React.useEffect(() => {
    const keys = new Set(items.map(item => itemToKey(item)));
    for (const key of Array.from(keys)) {
      if (!keys.has(key)) {
        keys.delete(key);
      }
    }
  }, [items]);

  const setElement = (item: T, element: HTMLDivElement) => {
    keyToElementMap.set(itemToKey(item), element);
  };

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

/**
 * containerとitemsのセレクタで指定された2点の位置差を返す
 * containerのセレクタの点が上なら正の値を、下なら負の値を返す
 * containerかitemsのElementが存在しなければNoneを返す
 */
export type GetDiff = (
  containerPositionSelector: ContainerPositionSelector,
  itemsPositionSelector: ItemsPositionSelector,
) => Option<number>;

/**
 * GetDiffの最小値を返す
 */
export type GetDiffMin<T> = (
  containerPositionSelector: ContainerPositionSelector,
  itemsPositionRatio: number,
) => Option<[number, T]>;

/**
 * containerとitemsのセレクタで指定された2点の位置差がdiffになるようにスクロール位置を調整するコマンド
 */
export interface SetScrollCmd {
  containerPositionSelector: ContainerPositionSelector;
  itemsPositionSelector: ItemsPositionSelector;
  diff: number;
}

export interface ScrollProps<T> {
  itemToKey: (item: T) => string;
  renderItem: (item: T) => JSX.Element;
  scrollDebounce: number;
  onScroll: (getDiff: GetDiff, getDiffMin: GetDiffMin<T>) => void;
  setScroll: rx.Observable<SetScrollCmd>;
  style?: React.CSSProperties;
  className?: string;
  items: ReadonlyArray<T>;
  changeItems: (items: ReadonlyArray<T>) => void;
}

export const Scroll = <T,>(props: ScrollProps<T>) => {
  const containerElementRef = React.useRef<HTMLDivElement | null>(null);
  const [keyToElementMap, setElement] = useKeyToElementMap<T>(
    props.itemToKey,
    props.items,
  );

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

  const getDiffMin = React.useCallback(
    (
      containerPositionSelector: ContainerPositionSelector,
      itemsPositionRatio: number,
    ): Option<[number, T]> => {
      /*
      TODO: 三分探索とか使って高速化
      getDiffがnoneの可能性もあるので一度でもnoneがでたら全探索とか(Noneが出る可能性は全スクロールを母数とするとめったにない)工夫が必要
      */
      let min: Option<[number, T]> = O.none;

      for (const item of props.items) {
        const diff = getDiff(containerPositionSelector, {
          ratio: itemsPositionRatio,
          key: props.itemToKey(item),
        });
        if (O.isSome(diff)) {
          if (O.isNone(min) || diff.value < min.value[0]) {
            min = O.some([diff.value, item]);
          }
        }
      }

      return min;
    },
    [props.itemToKey],
  );

  const getDiffMinRef = useValueRef(getDiffMin);

  React.useEffect(() => {
    const containerElement = containerElementRef.current;
    if (containerElement !== null) {
      const subs = rx
        .fromEvent(containerElement, "scroll")
        .pipe(op.debounceTime(props.scrollDebounce))
        .subscribe(() => {
          props.onScroll(getDiff, getDiffMinRef.current);
        });

      return () => {
        subs.unsubscribe();
      };
    }
  }, [containerElementRef.current, props.scrollDebounce]);

  React.useEffect(() => {
    const subs = props.setScroll.subscribe(cmd => {
      const curDiff = getDiff(
        cmd.containerPositionSelector,
        cmd.itemsPositionSelector,
      );

      const containerElement = containerElementRef.current;
      if (containerElement === null || O.isNone(curDiff)) {
        return;
      }

      containerElement.scrollTop += curDiff.value - cmd.diff;
    });
    return () => {
      subs.unsubscribe();
    };
  }, [props.setScroll]);

  return (
    <div
      className={props.className}
      style={props.style}
      ref={containerElementRef}
    >
      {props.items.map(item => (
        <div
          key={props.itemToKey(item)}
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
};
