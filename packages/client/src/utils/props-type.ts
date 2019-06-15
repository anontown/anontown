import * as React from "react";
export type PropsType<C> = C extends React.ComponentType<infer P> ? P : never;
