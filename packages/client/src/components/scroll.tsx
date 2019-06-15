import { arrayDrop, arrayFirst, arrayLast, nullMap, pipe, undefinedMap, undefinedUnwrap, debugPrint } from "@kgtkr/utils";
import { DocumentNode } from "graphql";
import * as React from "react";
import { OnSubscriptionDataOptions, useQuery, useSubscription } from "react-apollo-hooks";
import * as rx from "rxjs";
import * as op from "rxjs/operators";
import { setTimeout } from "timers";
import * as G from "../../generated/graphql";
import { queryResultConvert, useEffectCond, useEffectRef, useFunctionRef, useLock, useValueRef } from "../utils";

interface ListItemData {
  id: string;
  date: string;
}

interface ItemElPair<T extends ListItemData> {
  item: T;
  el: HTMLDivElement;
}

export interface ScrollProps
  <T extends ListItemData, QueryResult, QueryVariables, SubscriptionResult, SubscriptionVariables> {
  newItemOrder: "top" | "bottom";
  query: DocumentNode;
  queryVariables: (dateQuery: G.DateQuery) => QueryVariables;
  queryResultConverter: (result: QueryResult) => T[];
  queryResultMapper: (result: QueryResult, f: (data: T[]) => T[]) => QueryResult;
  subscription: DocumentNode;
  subscriptionVariables: SubscriptionVariables;
  subscriptionResultConverter: (result: SubscriptionResult) => T;
  onSubscription: (item: SubscriptionResult) => void;
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

type Cmd = { type: "reset", date: string } | { type: "after" } | { type: "before" };

export const Scroll = <T extends ListItemData, QueryResult, QueryVariables, SubscriptionResult, SubscriptionVariables>
  (props: ScrollProps<T, QueryResult, QueryVariables, SubscriptionResult, SubscriptionVariables>) => {
  const rootEl = React.useRef<HTMLDivElement | null>(null);

  const initDate = React.useMemo(() => props.initDate, []);
  const variables = props.queryVariables({
    date: initDate,
    type: "lte",
  });
  const data = useQuery<QueryResult, QueryVariables>(props.query, {
    variables,
  });
  queryResultConvert(data);

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

  useEffectCond(() => {
    runCmd({ type: "reset", date: initDate });
  }, () => data.data !== undefined);

  React.useEffect(() => {
    if (data.data !== undefined) {
      props.changeItems(props.queryResultConverter(data.data));
    }
  }, [data.data]);

  const idElMap = React.useMemo(() => new Map<string, HTMLDivElement>(), []);
  React.useEffect(() => {
    if (data.data !== undefined) {
      const items = new Set(props.queryResultConverter(data.data).map(x => x.id));
      for (const id of idElMap.keys()) {
        if (!items.has(id)) {
          idElMap.delete(id);
        }
      }
    } else {
      idElMap.clear();
    }

  }, [data.data, idElMap]);

  const toTop = useFunctionRef(async () => {
    await sleep(0);
    if (rootEl.current !== null) {
      rootEl.current.scrollTop = 0;
    }
  });

  const toBottom = useFunctionRef(async () => {
    await sleep(0);
    if (rootEl.current !== null) {
      rootEl.current.scrollTop = rootEl.current.scrollHeight;
    }
  });

  const scrollLock = useFunctionRef(async (f: () => Promise<void>) => {
    await sleep(0);
    const elData = pipe(data.data)
      .chain(undefinedMap(props.queryResultConverter))
      .chain(undefinedMap(arrayFirst))
      .chain(undefinedMap(x => idElMap.get(x.id)))
      .chain(undefinedMap(x => ({ el: x, y: elY(x) })))
      .value;
    try {
      await f();
    } catch (e) {
      throw e;
    } finally {
      if (elData !== undefined) {
        await sleep(0);
        if (rootEl.current !== null) {
          rootEl.current.scrollTop += elY(elData.el) - elData.y;
        }
      }
    }
  });

  // 上端に一番近いアイテム
  const getTopElement = useFunctionRef(async () => {
    await sleep(0);

    if (data.data === undefined) {
      return null;
    }

    const items = props.queryResultConverter(data.data);

    // 最短距離のアイテム
    const minItem = items
      .map(item => {
        const el = idElMap.get(item.id);
        if (el !== undefined) {
          return ({ item, el });
        } else {
          return null;
        }
      }).filter((x): x is ItemElPair<T> => x !== null)
      .reduce<ItemElPair<T> | null>((min, item) => {
        if (min === null) {
          return item;
        } else if (Math.abs(min.el.getBoundingClientRect().top +
          min.el.getBoundingClientRect().height / 2) >
          Math.abs(item.el.getBoundingClientRect().top +
            item.el.getBoundingClientRect().height / 2)) {
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

    if (data.data === undefined) {
      return null;
    }

    const items = props.queryResultConverter(data.data);

    // 最短距離のアイテム
    const minItem = items
      .map(item => {
        const el = idElMap.get(item.id);
        if (el !== undefined) {
          return ({ item, el });
        } else {
          return null;
        }
      })
      .filter((x): x is ItemElPair<T> => x !== null)
      .reduce<ItemElPair<T> | null>((min, item) => {
        if (min === null) {
          return item;
        } else if (Math.abs(window.innerHeight -
          (min.el.getBoundingClientRect().top +
            min.el.getBoundingClientRect().height / 2)) >
          Math.abs(window.innerHeight -
            (item.el.getBoundingClientRect().top +
              item.el.getBoundingClientRect().height / 2))) {
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
    if (data.data === undefined) {
      return;
    }

    const items = props.queryResultConverter(data.data);

    const first = arrayFirst(items);
    if (first === undefined) {
      await resetDate(new Date().toISOString());
    } else {
      await scrollLock(async () => {
        await data.fetchMore({
          variables: props.queryVariables({
            date: first.date,
            type: "gt",
          }),
          updateQuery: (prev, { fetchMoreResult }) => {
            if (!fetchMoreResult) { return prev; }

            return props.queryResultMapper(prev, x => [...props.queryResultConverter(fetchMoreResult), ...x]);
          },
        });
      });
    }
  });

  const findBefore = useFunctionRef(async () => {
    if (data.data === undefined) {
      return;
    }

    const items = props.queryResultConverter(data.data);

    const old = arrayLast(items);
    if (old === undefined) {
      await resetDate(new Date().toISOString());
    } else {
      await scrollLock(async () => {
        await data.fetchMore({
          variables: props.queryVariables({
            date: old.date,
            type: "lt",
          }),
          updateQuery: (prev, { fetchMoreResult }) => {
            if (!fetchMoreResult) { return prev; }

            return props.queryResultMapper(prev, x => [...x, ...props.queryResultConverter(fetchMoreResult)]);
          },
        });
      });
    }
  });

  const resetDate = useFunctionRef(async (date: string) => {
    await data.refetch(props.queryVariables({
      date,
      type: "lte",
    }));
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

  useEffectRef(f => {
    const el = rootEl.current;
    const subs = el !== null
      ? rx.fromEvent(el, "scroll")
        .pipe(op.map(() => el.scrollTop),
          op.filter(top => Math.abs(top) <= props.width),
          op.debounceTime(props.debounceTime))
        .subscribe(() => f.current()) :
      null;
    return () => {
      if (subs !== null) {
        subs.unsubscribe();
      }
    };
  }, () => {
    switch (props.newItemOrder) {
      case "top":
        runCmd({ type: "after" });
        break;
      case "bottom":
        runCmd({ type: "before" });
        break;
    }
  }, [rootEl.current, props.debounceTime]);

  useEffectRef(f => {
    const el = rootEl.current;
    const subs = el !== null
      ? rx.fromEvent(el, "scroll")
        .pipe(
          op.map(() => el.scrollTop + el.clientHeight),
          op.distinctUntilChanged(),
          op.filter(bottom => props.width >= Math.abs(el.scrollHeight - bottom)),
          op.debounceTime(props.debounceTime)
        )
        .subscribe(() => f.current())
      : null;
    return () => {
      if (subs !== null) {
        subs.unsubscribe();
      }
    };
  }, () => {
    switch (props.newItemOrder) {
      case "bottom":
        runCmd({ type: "after" });
        break;
      case "top":
        runCmd({ type: "before" });
        break;
    }
  }, [rootEl.current, props.debounceTime]);

  const getTopBottomElementRef = useValueRef(() => props.newItemOrder === "top" ? getTopElement() : getBottomElement());

  useEffectRef(f => {
    const el = rootEl.current;
    const subs = el !== null
      ? rx.fromEvent(el, "scroll")
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
  }, (newItem: T | null) => {
    if (newItem !== null) {
      props.scrollNewItemChange(newItem);
    }
  }, [rootEl.current, props.debounceTime]);

  useEffectRef(f => {
    const subs = rx
      .interval(100)
      .subscribe(() => f.current());
    return () => {
      subs.unsubscribe();
    };
  }, () => {
    const el = rootEl.current;
    if (props.isAutoScroll && el !== null) {
      el.scrollTop += props.autoScrollSpeed;
    }
  }, []);

  useEffectRef(f => {
    const subs = props.scrollNewItem.subscribe(x => f.current(x));
    return () => {
      subs.unsubscribe();
    };
  }, (date: string) => {
    runCmd({ type: "reset", date });
  }, [props.scrollNewItem]);

  const onSubscriptionDataRef = useValueRef(({ client, subscriptionData }
    : OnSubscriptionDataOptions<SubscriptionResult>) => {
    if (subscriptionData.data !== undefined) {
      const subsData = props.subscriptionResultConverter(subscriptionData.data);
      const prev = client.readQuery<QueryResult, QueryVariables>({ query: props.query, variables });
      if (prev !== null) {
        client.writeQuery({
          query: props.query,
          variables,
          data: props.queryResultMapper(prev, x => [subsData, ...x]),
        });
      }
      props.onSubscription(subscriptionData.data);
    }
  });
  useSubscription<SubscriptionResult, SubscriptionVariables>(props.subscription, {
    variables: props.subscriptionVariables,
    onSubscriptionData: x => onSubscriptionDataRef.current(x),
  });

  return (
    <div className={props.className} style={props.style} ref={rootEl}>
      {data.data !== undefined
        ? (props.newItemOrder === "bottom"
          ? [...props.queryResultConverter(data.data)].reverse()
          : props.queryResultConverter(data.data))
          .map(item => <div
            key={item.id}
            ref={el => {
              if (el !== null) {
                idElMap.set(item.id, el);
              }
            }}
          >
            {props.dataToEl(item)}
          </div>)
        : null}
      {data.loading ? "Loading" : null}
      {data.error !== undefined ? "エラーが発生しました" : null}
    </div>
  );
};
