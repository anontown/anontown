import * as React from "react";
import { rx, rxOps } from "../prelude";
import { useEffectRef } from "./ref";

export function useInputCache<T>(
  init: T,
  update: (x: T) => void,
  dueTime = 1000,
): [T, React.Dispatch<React.SetStateAction<T>>] {
  const subject = React.useMemo(() => new rx.Subject<T>(), []);
  const [cache, setCache] = React.useState(init);

  React.useEffect(() => {
    subject.next(cache);
  }, [cache]);

  useEffectRef(
    f => {
      const subs = subject.pipe(rxOps.debounceTime(dueTime)).subscribe(x => {
        f.current(x);
      });

      return () => {
        subs.unsubscribe();
      };
    },
    update,
    [],
  );

  return [cache, setCache];
}
