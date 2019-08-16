import { arrayFirst, arrayLast } from "@kgtkr/utils";
import * as React from "react";
import * as rx from "rxjs";
import * as op from "rxjs/operators";
import { setTimeout } from "timers";
import * as G from "../generated/graphql";
import { useEffectRef, useFunctionRef, useLock, useValueRef } from "../hooks";
import { pipe } from "fp-ts/lib/pipeable";
import * as oset from "../utils/ord-set";
import { array, option } from "fp-ts";

function useToTop(el: HTMLDivElement | null) {
  const elRef = React.useRef(el);
  return async () => {
    await sleep(0);
    if (elRef.current !== null) {
      elRef.current.scrollTop = 0;
    }
  };
}

function useToBottom(el: HTMLDivElement | null) {
  const elRef = React.useRef(el);
  return async () => {
    await sleep(0);
    if (elRef.current !== null) {
      elRef.current.scrollTop = elRef.current.scrollHeight;
    }
  };
}

function useIdElMap<T extends ListItemData>(data: oset.OrdSet<T, string>) {
  const idElMap = React.useMemo(() => new Map<string, HTMLDivElement>(), []);
  React.useEffect(() => {
    const items = new Set(oset.toArray(data).map(x => x.id));
    for (const id of idElMap.keys()) {
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

interface ListItemData {
  id: string;
  date: string;
}

interface ItemElPair<T extends ListItemData> {
  item: T;
  el: HTMLDivElement;
}

export interface ScrollProps<T extends ListItemData> {
  newItemOrder: "top" | "bottom";
  fetchKey: unknown[];
  useFetch: () => (date: G.DateQuery) => Promise<T[]>;
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
  changeItems: (items: T[]) => void;
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

export const Scroll = <T extends ListItemData>(props: ScrollProps<T>) => {
  const rootEl = React.useRef<HTMLDivElement | null>(null);

  const [data, setData] = React.useState(
    oset.make<T, string>(
      (a, b) => new Date(b.date).valueOf() - new Date(a.date).valueOf(),
      x => x.id,
    ),
  );

  const fetch = props.useFetch();
  React.useEffect(() => {
    runCmd({ type: "reset", date: props.initDate });
  }, [props.initDate.valueOf(), ...props.fetchKey]);

  const lock = useLock();
  const runCmd = useFunctionRef(async (cmd: Cmd) => {
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
  });

  React.useEffect(() => {
    props.changeItems(oset.toArray(data));
  }, [oset.toArray(data)]);

  const { idElMap, addFunction } = useIdElMap<T>(data);

  const toTop = useToTop(rootEl.current);
  const toBottom = useToBottom(rootEl.current);

  const scrollLock = useFunctionRef(async (f: () => Promise<void>) => {
    await sleep(0);
    const elData = pipe(
      oset.toArray(data),
      array.head,
      option.chain(x => option.fromNullable(idElMap.get(x.id))),
      option.map(x => ({ el: x, y: elY(x) })),
    );
    try {
      await f();
    } catch (e) {
      throw e;
    } finally {
      if (option.isSome(elData)) {
        await sleep(0);
        if (rootEl.current !== null) {
          rootEl.current.scrollTop += elY(elData.value.el) - elData.value.y;
        }
      }
    }
  });

  // 上端に一番近いアイテム
  const getTopElement = useFunctionRef(async () => {
    await sleep(0);

    // 最短距離のアイテム
    const minItem = oset
      .toArray(data)
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
  });

  // 下端に一番近いアイテム
  const getBottomElement = useFunctionRef(async () => {
    await sleep(0);

    // 最短距離のアイテム
    const minItem = oset
      .toArray(data)
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
  });

  const findAfter = useFunctionRef(async () => {
    const first = arrayFirst(oset.toArray(data));
    if (first === undefined) {
      await resetDate(new Date().toISOString());
    } else {
      await scrollLock(async () => {
        const result = await fetch({
          date: first.date,
          type: "gt",
        });

        setData(oset.unsafePushFirstOrdAndUniqueArray(data, result));
      });
    }
  });

  const findBefore = useFunctionRef(async () => {
    const old = arrayLast(oset.toArray(data));
    if (old === undefined) {
      await resetDate(new Date().toISOString());
    } else {
      await scrollLock(async () => {
        const result = await fetch({
          date: old.date,
          type: "lt",
        });

        setData(oset.unsafePushLastOrdAndUniqueArray(data, result));
      });
    }
  });

  const resetDate = useFunctionRef(async (date: string) => {
    const result = await fetch({
      date,
      type: "lte",
    });

    setData(
      pipe(
        data,
        oset.clear,
        x => oset.unsafePushFirstOrdAndUniqueArray(x, result),
      ),
    );

    switch (props.newItemOrder) {
      case "bottom":
        await toBottom();
        break;
      case "top":
        await toTop();
        break;
    }
    await findAfter();
  });

  useEffectRef(
    f => {
      const el = rootEl.current;
      const subs =
        el !== null
          ? rx
              .fromEvent(el, "scroll")
              .pipe(
                op.map(() => el.scrollTop),
                op.filter(top => Math.abs(top) <= props.width),
                op.debounceTime(props.debounceTime),
              )
              .subscribe(() => f.current())
          : null;
      return () => {
        if (subs !== null) {
          subs.unsubscribe();
        }
      };
    },
    () => {
      switch (props.newItemOrder) {
        case "top":
          runCmd({ type: "after" });
          break;
        case "bottom":
          runCmd({ type: "before" });
          break;
      }
    },
    [rootEl.current, props.debounceTime],
  );

  useEffectRef(
    f => {
      const el = rootEl.current;
      const subs =
        el !== null
          ? rx
              .fromEvent(el, "scroll")
              .pipe(
                op.map(() => el.scrollTop + el.clientHeight),
                op.distinctUntilChanged(),
                op.filter(
                  bottom => props.width >= Math.abs(el.scrollHeight - bottom),
                ),
                op.debounceTime(props.debounceTime),
              )
              .subscribe(() => f.current())
          : null;
      return () => {
        if (subs !== null) {
          subs.unsubscribe();
        }
      };
    },
    () => {
      switch (props.newItemOrder) {
        case "bottom":
          runCmd({ type: "after" });
          break;
        case "top":
          runCmd({ type: "before" });
          break;
      }
    },
    [rootEl.current, props.debounceTime],
  );

  const getTopBottomElementRef = useValueRef(() =>
    props.newItemOrder === "top" ? getTopElement() : getBottomElement(),
  );

  useEffectRef(
    f => {
      const el = rootEl.current;
      const subs =
        el !== null
          ? rx
              .fromEvent(el, "scroll")
              .pipe(
                op.debounceTime(props.debounceTime),
                op.mergeMap(() => getTopBottomElementRef.current()),
              )
              .subscribe(x => f.current(x))
          : null;
      return () => {
        if (subs !== null) {
          subs.unsubscribe();
        }
      };
    },
    (newItem: T | null) => {
      if (newItem !== null) {
        props.scrollNewItemChange(newItem);
      }
    },
    [rootEl.current, props.debounceTime],
  );

  useEffectRef(
    f => {
      const subs = rx.interval(100).subscribe(() => f.current());
      return () => {
        subs.unsubscribe();
      };
    },
    () => {
      const el = rootEl.current;
      if (props.isAutoScroll && el !== null) {
        el.scrollTop += props.autoScrollSpeed;
      }
    },
    [],
  );

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

  const onSubscriptionDataRef = useValueRef((newData: T) => {
    setData(
      pipe(
        data,
        x => oset.unsafePushFirstOrdAndUniqueArray(x, [newData]),
      ),
    );
  });
  props.useStream(x => onSubscriptionDataRef.current(x));
  return (
    <div className={props.className} style={props.style} ref={rootEl}>
      {(props.newItemOrder === "bottom"
        ? [...oset.toArray(data)].reverse()
        : oset.toArray(data)
      ).map(item => (
        <div key={item.id} ref={el => addFunction(item.id, el)}>
          {props.dataToEl(item)}
        </div>
      ))}
    </div>
  );
};
