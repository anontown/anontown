import useRouter from "use-react-router";
import * as React from "react";

export function useOnChnageUrlSearch<A>(
  parse: (query: string) => A,
  onChange: (x: A) => void,
): A {
  const { history, location } = useRouter();

  React.useEffect(() => {
    return history.listen((e, action) => {
      if (action === "POP") {
        onChange(parse(e.search));
      }
    });
  }, []);

  const init = React.useMemo(() => parse(location.search), []);
  return init;
}
