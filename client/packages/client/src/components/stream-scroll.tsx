import * as React from "react";
import * as rx from "rxjs";
import * as op from "rxjs/operators";
import { setTimeout } from "timers";
import * as G from "../generated/graphql";
import { useEffectRef, useLock, useValueRef } from "../hooks";
import { pipe, Ord, OrdT, O, RA, ArrayExtra } from "../prelude";
import { useInterval } from "react-use";

interface ListItemData {
  id: string;
  date: string;
}

function getKeyFromListItemData<T extends ListItemData>(x: T): ListItemKey {
  return [-new Date(x.date).valueOf(), x.id];
}

type ListItemKey = [number, string];
const ordListItemKey: Ord<ListItemKey> = OrdT.getTupleOrd(
  OrdT.ordNumber,
  OrdT.ordString,
);

function useToTop(el: HTMLDivElement | null) {
  const elRef = useValueRef(el);
  return React.useCallback(async () => {
    if (elRef.current !== null) {
      elRef.current.scrollTop = 0;
    }
  }, []);
}

function useToBottom(el: HTMLDivElement | null) {
  const elRef = useValueRef(el);
  return React.useCallback(async () => {
    if (elRef.current !== null) {
      elRef.current.scrollTop = elRef.current.scrollHeight;
    }
  }, []);
}

function useIdElMap<T extends ListItemData>(data: ReadonlyArray<T>) {
  const idElMap = React.useMemo(() => new Map<string, HTMLDivElement>(), []);
  React.useEffect(() => {
    const items = new Set(data.map(x => x.id));
    for (const id of Array.from(idElMap.keys())) {
      if (!items.has(id)) {
        idElMap.delete(id);
      }
    }
  }, [idElMap, data]);

  const addFunction = React.useCallback(
    (key: string, el: HTMLDivElement | null) => {
      if (el !== null) {
        idElMap.set(key, el);
      }
    },
    [idElMap],
  );

  return { idElMap, addFunction };
}

// 上端に一番近いアイテム
function useGetTopElement<T extends ListItemData>(
  data: ReadonlyArray<T>,
  idElMap: Map<string, HTMLDivElement>,
) {
  return React.useCallback(async () => {
    await sleep(0);

    // 最短距離のアイテム
    const minItem = data
      .map(item => {
        const el = idElMap.get(item.id);
        if (el !== undefined) {
          return { item, el };
        } else {
          return null;
        }
      })
      .filter((x): x is ItemElPair<T> => x !== null)
      .reduce<ItemElPair<T> | null>((min, item) => {
        if (min === null) {
          return item;
        } else if (
          Math.abs(
            min.el.getBoundingClientRect().top +
              min.el.getBoundingClientRect().height / 2,
          ) >
          Math.abs(
            item.el.getBoundingClientRect().top +
              item.el.getBoundingClientRect().height / 2,
          )
        ) {
          return item;
        } else {
          return min;
        }
      }, null);

    if (minItem !== null) {
      return minItem.item;
    } else {
      return null;
    }
  }, [data, idElMap]);
}

// 下端に一番近いアイテム
function useGetBottomElement<T extends ListItemData>(
  data: ReadonlyArray<T>,
  idElMap: Map<string, HTMLDivElement>,
) {
  return React.useCallback(async () => {
    await sleep(0);

    // 最短距離のアイテム
    const minItem = data
      .map(item => {
        const el = idElMap.get(item.id);
        if (el !== undefined) {
          return { item, el };
        } else {
          return null;
        }
      })
      .filter((x): x is ItemElPair<T> => x !== null)
      .reduce<ItemElPair<T> | null>((min, item) => {
        if (min === null) {
          return item;
        } else if (
          Math.abs(
            window.innerHeight -
              (min.el.getBoundingClientRect().top +
                min.el.getBoundingClientRect().height / 2),
          ) >
          Math.abs(
            window.innerHeight -
              (item.el.getBoundingClientRect().top +
                item.el.getBoundingClientRect().height / 2),
          )
        ) {
          return item;
        } else {
          return min;
        }
      }, null);

    if (minItem !== null) {
      return minItem.item;
    } else {
      return null;
    }
  }, [data, idElMap]);
}

function useScrollLock<T extends ListItemData>(
  data: ReadonlyArray<T>,
  idElMap: Map<string, HTMLDivElement>,
  rootEl: HTMLDivElement | null,
) {
  return React.useCallback(
    async (f: () => Promise<void>) => {
      await sleep(0);
      const elData = pipe(
        data,
        RA.head,
        O.chain(x => O.fromNullable(idElMap.get(x.id))),
        O.map(x => ({ el: x, y: elY(x) })),
      );
      try {
        await f();
      } finally {
        if (O.isSome(elData)) {
          if (rootEl !== null) {
            rootEl.scrollTop += elY(elData.value.el) - elData.value.y;
          }
        }
      }
    },
    [data, idElMap, rootEl],
  );
}

function useAutoScroll(
  isAutoScroll: boolean,
  autoScrollSpeed: number,
  rootEl: HTMLDivElement | null,
) {
  useInterval(() => {
    if (isAutoScroll && rootEl !== null) {
      rootEl.scrollTop += autoScrollSpeed;
    }
  }, 100);
}

function useOnTopScroll(
  f: () => void,
  rootEl: HTMLDivElement | null,
  width: number,
  debounceTime: number,
) {
  const fRef = useValueRef(f);
  const widthRef = useValueRef(width);

  React.useEffect(() => {
    const subs =
      rootEl !== null
        ? rx
            .fromEvent(rootEl, "scroll")
            .pipe(
              op.map(() => rootEl.scrollTop),
              op.filter(top => Math.abs(top) <= widthRef.current),
              op.debounceTime(debounceTime),
            )
            .subscribe(() => fRef.current())
        : null;
    return () => {
      if (subs !== null) {
        subs.unsubscribe();
      }
    };
  }, [rootEl, debounceTime]);
}

function useOnBottomScroll(
  f: () => void,
  rootEl: HTMLDivElement | null,
  width: number,
  debounceTime: number,
) {
  const fRef = useValueRef(f);
  const widthRef = useValueRef(width);

  // 下までスクロール
  React.useEffect(() => {
    const subs =
      rootEl !== null
        ? rx
            .fromEvent(rootEl, "scroll")
            .pipe(
              op.map(() => rootEl.scrollTop + rootEl.clientHeight),
              op.distinctUntilChanged(),
              op.filter(
                bottom =>
                  widthRef.current >= Math.abs(rootEl.scrollHeight - bottom),
              ),
              op.debounceTime(debounceTime),
            )
            .subscribe(() => fRef.current())
        : null;
    return () => {
      if (subs !== null) {
        subs.unsubscribe();
      }
    };
  }, [rootEl, debounceTime]);
}

function useFetchUtils<T extends ListItemData>(
  useFetch: () => (date: G.DateQuery) => Promise<ReadonlyArray<T>>,
  rootEl: HTMLDivElement | null,
  data: ReadonlyArray<T>,
  idElMap: Map<string, HTMLDivElement>,
  setData: (x: ReadonlyArray<T>) => void,
  newItemOrder: "top" | "bottom",
) {
  const fetch = useFetch();

  const toTop = useToTop(rootEl);
  const toBottom = useToBottom(rootEl);

  const scrollLock = useScrollLock(data, idElMap, rootEl);

  const findAfterWithData = React.useCallback(
    async (os: ReadonlyArray<T>) => {
      const first = RA.head(os);
      if (O.isSome(first)) {
        await scrollLock(async () => {
          const result = await fetch({
            date: first.value.date,
            type: "gt",
          });

          setData(
            ArrayExtra.mergeAndUniqSortedArray(ordListItemKey)(
              getKeyFromListItemData,
              result,
            )(os),
          );
        });
      }
    },
    [scrollLock, fetch, setData],
  );

  const findBeforeWithData = React.useCallback(
    async (os: ReadonlyArray<T>) => {
      const old = RA.last(os);
      if (O.isSome(old)) {
        await scrollLock(async () => {
          const result = await fetch({
            date: old.value.date,
            type: "lt",
          });

          setData(
            ArrayExtra.mergeAndUniqSortedArray(ordListItemKey)(
              getKeyFromListItemData,
              result,
            )(os),
          );
        });
      }
    },
    [scrollLock, fetch, setData],
  );

  const resetDate = React.useCallback(
    async (date: string) => {
      const result = await fetch({
        date,
        type: "lte",
      });

      setData(result);

      switch (newItemOrder) {
        case "bottom":
          await toBottom();
          break;
        case "top":
          await toTop();
          break;
      }
      await findAfterWithData(result);
    },
    [data, setData, fetch, newItemOrder, toBottom, toTop, findAfterWithData],
  );

  const findBefore = React.useCallback(async () => {
    if (data.length === 0) {
      await resetDate(new Date().toISOString());
    } else {
      await findBeforeWithData(data);
    }
  }, [data, resetDate, findBeforeWithData]);

  const findAfter = React.useCallback(async () => {
    if (data.length === 0) {
      await resetDate(new Date().toISOString());
    } else {
      await findAfterWithData(data);
    }
  }, [data, resetDate, findAfterWithData]);

  return { findAfter, findBefore, resetDate };
}

function useOnChangeCurrentItem<T extends ListItemData>(
  f: (item: T) => void,
  data: ReadonlyArray<T>,
  idElMap: Map<string, HTMLDivElement>,
  rootEl: HTMLDivElement | null,
  debounceTime: number,
  newItemOrder: "top" | "bottom",
) {
  const fRef = useValueRef(f);
  const newItemOrderRef = useValueRef(newItemOrder);

  const getTopElement = useGetTopElement(data, idElMap);
  const getBottomElement = useGetBottomElement(data, idElMap);

  // スクロールによってアイテムが変化した
  React.useEffect(() => {
    const subs =
      rootEl !== null
        ? rx
            .fromEvent(rootEl, "scroll")
            .pipe(
              op.debounceTime(debounceTime),
              op.mergeMap(() =>
                newItemOrderRef.current === "top"
                  ? getTopElement()
                  : getBottomElement(),
              ),
            )
            .subscribe(x => {
              if (x !== null) {
                fRef.current(x);
              }
            })
        : null;
    return () => {
      if (subs !== null) {
        subs.unsubscribe();
      }
    };
  }, [rootEl, debounceTime, getTopElement, useGetBottomElement]);
}
interface ItemElPair<T extends ListItemData> {
  item: T;
  el: HTMLDivElement;
}

export interface StreamScrollProps<T extends ListItemData> {
  newItemOrder: "top" | "bottom";
  fetchKey: Array<unknown>;
  useFetch: () => (date: G.DateQuery) => Promise<ReadonlyArray<T>>;
  useStream: (f: (item: T) => void) => void;
  width: number;
  debounceTime: number;
  autoScrollSpeed: number;
  isAutoScroll: boolean;
  // スクロール位置変更イベント
  scrollNewItemChange: (item: T) => void;
  // スクロール位置変更命令
  scrollNewItem: rx.Observable<string>;
  initDate: string;
  dataToEl: (data: T) => JSX.Element;
  style?: React.CSSProperties;
  className?: string;
  items: ReadonlyArray<T>;
  changeItems: (items: ReadonlyArray<T>) => void;
  existUnread: boolean;
  onChangeExistUnread: (existUnread: boolean) => void;
}

function elHeight(el: HTMLElement) {
  return el.offsetHeight;
}

function elTop(el: HTMLElement) {
  return el.offsetTop;
}

function elY(el: HTMLElement) {
  return elTop(el) + elHeight(el) / 2;
}

function sleep(ms: number) {
  return new Promise<void>(resolve => {
    setTimeout(() => {
      resolve();
    }, ms);
  });
}

type Cmd =
  | { type: "reset"; date: string }
  | { type: "after" }
  | { type: "before" };

export const StreamScroll = <T extends ListItemData>(
  props: StreamScrollProps<T>,
) => {
  const rootEl = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    runCmd({ type: "reset", date: props.initDate });
  }, [props.initDate.valueOf(), ...props.fetchKey]);

  const { idElMap, addFunction } = useIdElMap<T>(props.items);
  const { resetDate, findBefore, findAfter } = useFetchUtils(
    props.useFetch,
    rootEl.current,
    props.items,
    idElMap,
    props.changeItems,
    props.newItemOrder,
  );

  const lock = useLock();
  const runCmd = React.useCallback(
    async (cmd: Cmd) => {
      await lock(async () => {
        switch (cmd.type) {
          case "reset":
            await resetDate(cmd.date);
            break;
          case "before":
            await findBefore();
            break;
          case "after":
            await findAfter();
            break;
        }
      });
    },
    [props.fetchKey, lock, resetDate, findBefore, findAfter],
  );

  // 上までスクロール
  useOnTopScroll(
    () => {
      switch (props.newItemOrder) {
        case "top":
          props.onChangeExistUnread(false);
          runCmd({ type: "after" });
          break;
        case "bottom":
          runCmd({ type: "before" });
          break;
      }
    },
    rootEl.current,
    props.width,
    props.debounceTime,
  );

  // 下までスクロール
  useOnBottomScroll(
    () => {
      switch (props.newItemOrder) {
        case "bottom":
          props.onChangeExistUnread(false);
          runCmd({ type: "after" });
          break;
        case "top":
          runCmd({ type: "before" });
          break;
      }
    },
    rootEl.current,
    props.width,
    props.debounceTime,
  );

  useOnChangeCurrentItem(
    newItem => {
      props.scrollNewItemChange(newItem);
    },
    props.items,
    idElMap,
    rootEl.current,
    props.debounceTime,
    props.newItemOrder,
  );

  // 自動スクロール
  useAutoScroll(props.isAutoScroll, props.autoScrollSpeed, rootEl.current);

  // スクロール位置変更入力
  useEffectRef(
    f => {
      const subs = props.scrollNewItem.subscribe(x => f.current(x));
      return () => {
        subs.unsubscribe();
      };
    },
    (date: string) => {
      runCmd({ type: "reset", date });
    },
    [props.scrollNewItem],
  );

  // 新しいアイテム追加イベント
  const onSubscriptionDataRef = useValueRef((newData: T) => {
    props.onChangeExistUnread(true);
    props.changeItems(
      pipe(
        props.items,
        ArrayExtra.mergeAndUniqSortedArray(ordListItemKey)(
          item => getKeyFromListItemData(item),
          [newData],
        ),
      ),
    );
  });
  props.useStream(x => onSubscriptionDataRef.current(x));

  return (
    <div className={props.className} style={props.style} ref={rootEl}>
      {(props.newItemOrder === "bottom"
        ? RA.reverse(props.items)
        : props.items
      ).map(item => (
        <div key={item.id} ref={el => addFunction(item.id, el)}>
          {props.dataToEl(item)}
        </div>
      ))}
    </div>
  );
};
