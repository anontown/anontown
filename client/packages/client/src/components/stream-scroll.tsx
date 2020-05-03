import * as React from "react";
import * as rx from "rxjs";
import * as op from "rxjs/operators";
import { setTimeout } from "timers";
import * as G from "../generated/graphql";
import { useEffectRef, useLock, useValueRef } from "../hooks";
import { pipe, Ord, OrdT, O, RA, ArrayExtra } from "../prelude";
import { useInterval } from "react-use";
import { ScrollRef } from "./scroll";
import { Do } from "fp-ts-contrib/lib/Do";

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

function useToTop<T>(ref: React.MutableRefObject<ScrollRef<T> | null>) {
  return React.useCallback(async () => {
    if (ref.current !== null) {
      ref.current.modifyScrollTop(({}) => 0);
    }
  }, []);
}

function useToBottom<T>(ref: React.MutableRefObject<ScrollRef<T> | null>) {
  return React.useCallback(async () => {
    if (ref.current !== null) {
      ref.current.modifyScrollTop(({ scrollHeight }) => scrollHeight);
    }
  }, []);
}

function useScrollLock<T extends ListItemData>(
  ref: React.MutableRefObject<ScrollRef<T> | null>,
  items: ReadonlyArray<T>,
) {
  return React.useCallback(
    async (f: () => Promise<void>) => {
      await sleep(0);

      const id = pipe(
        items,
        RA.head,
        O.map(item => item.id),
      );
      const diff = Do(O.option)
        .bindL("id", ({}) => id)
        .bindL("scrollRef", ({}) => O.fromNullable(ref.current))
        .bindL("diff", ({ id, scrollRef }) =>
          scrollRef.getDiff({ ratio: 0 }, { key: id, ratio: 0 }),
        )
        .return(({ diff }) => diff);

      try {
        await f();
      } finally {
        if (O.isSome(id) && O.isSome(diff)) {
          ref.current?.setDiff(
            { ratio: 0 },
            { key: id.value, ratio: 0 },
            diff.value,
          );
        }
      }
    },
    [items],
  );
}

function useAutoScroll<T>(
  isAutoScroll: boolean,
  autoScrollSpeed: number,
  ref: React.MutableRefObject<ScrollRef<T> | null>,
) {
  useInterval(() => {
    if (isAutoScroll && ref.current !== null) {
      ref.current.modifyScrollTop(
        ({ scrollTop }) => scrollTop + autoScrollSpeed,
      );
    }
  }, 100);
}

function useFetchUtils<T extends ListItemData>(
  ref: React.MutableRefObject<ScrollRef<T> | null>,
  useFetch: () => (date: G.DateQuery) => Promise<ReadonlyArray<T>>,
  items: ReadonlyArray<T>,
  setItems: (x: ReadonlyArray<T>) => void,
  newItemOrder: "top" | "bottom",
) {
  const fetch = useFetch();

  const toTop = useToTop(ref);
  const toBottom = useToBottom(ref);

  const scrollLock = useScrollLock(ref, items);

  const findAfterWithData = React.useCallback(
    async (os: ReadonlyArray<T>) => {
      const first = RA.head(os);
      if (O.isSome(first)) {
        await scrollLock(async () => {
          const result = await fetch({
            date: first.value.date,
            type: "gt",
          });

          setItems(
            ArrayExtra.mergeAndUniqSortedArray(ordListItemKey)(
              getKeyFromListItemData,
              result,
            )(os),
          );
        });
      }
    },
    [scrollLock, fetch, setItems],
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

          setItems(
            ArrayExtra.mergeAndUniqSortedArray(ordListItemKey)(
              getKeyFromListItemData,
              result,
            )(os),
          );
        });
      }
    },
    [scrollLock, fetch, setItems],
  );

  const resetDate = React.useCallback(
    async (date: string) => {
      const result = await fetch({
        date,
        type: "lte",
      });

      setItems(result);

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
    [items, setItems, fetch, newItemOrder, toBottom, toTop, findAfterWithData],
  );

  const findBefore = React.useCallback(async () => {
    if (items.length === 0) {
      await resetDate(new Date().toISOString());
    } else {
      await findBeforeWithData(items);
    }
  }, [items, resetDate, findBeforeWithData]);

  const findAfter = React.useCallback(async () => {
    if (items.length === 0) {
      await resetDate(new Date().toISOString());
    } else {
      await findAfterWithData(items);
    }
  }, [items, resetDate, findAfterWithData]);

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

export interface StreamScrollProps<T extends ListItemData> {
  newItemOrder: "top" | "bottom";
  fetchKey: Array<unknown>;
  useFetch: () => (date: G.DateQuery) => Promise<ReadonlyArray<T>>;
  useStream: (f: (item: T) => void) => void;
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
