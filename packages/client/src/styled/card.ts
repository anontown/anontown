import styled from "styled-components";
import { undefinedUnwrapOr } from "@kgtkr/utils";
import * as chroma from "chroma-js";
import * as constant from "./constant";

export const Card = styled.div<{ padding?: "none" | "normal" }>`
  background-color: white;
  border-style: solid;
  border-color: ${chroma
    .mix(constant.color.foreground, constant.color.background, 0.7)
    .css()};
  border-width: 1px;
  padding: ${props => {
    switch (undefinedUnwrapOr<"none" | "normal">("normal")(props.padding)) {
      case "none":
        return "0px";
      case "normal":
        return "16px";
    }
  }};
  font-size: ${constant.fontSize.main}px;
  color: ${constant.color.font};
  font-family: ${constant.fontFamily.main};
  a {
    text-decoration: none;
    color: ${constant.color.link};
  }
  a:hover {
    text-decoration: underline;
  }
`;

export const CardTitle = styled.div`
  font-size: ${constant.fontSize.title}px;
  a {
    color: ${constant.color.font};
  }
`;

export const CardSub = styled.div`
  font-size: ${constant.fontSize.sub}px;
`;

export const CardMain = styled.div``;
