import * as React from "react";

export function useLock() {
  const isLock = React.useRef(false);
  return async (call: () => Promise<void>) => {
    if (isLock.current) {
      return;
    }

    isLock.current = true;
    try {
      await call();
    } catch (e) {
      throw e;
    } finally {
      isLock.current = false;
    }
  };
}
