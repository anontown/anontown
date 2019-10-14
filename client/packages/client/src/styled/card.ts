import { undefinedUnwrapOr } from "@kgtkr/utils";
import * as chroma from "chroma-js";
import styled from "styled-components";
import * as constant from "./constant";
import { textBase, textContent } from "./style";

export const Card = styled.div`
  background-color: white;
  border-style: solid;
  border-color: ${chroma
    .mix(constant.color.foreground, constant.color.background, 0.7)
    .css()};
  border-width: 1px;
  padding: ${({ padding }: { padding?: "none" | "normal" }) => {
    switch (undefinedUnwrapOr<"none" | "normal">("normal")(padding)) {
      case "none":
        return "0px";
      case "normal":
        return "16px";
    }
  }};
  ${textBase}
  ${textContent}
`;

export const CardHeader = styled.div``;
export const CardContent = styled.div``;
export const CardFlex = styled.div`
  display: flex;
`;
export const CardFlexFixed = styled.div`
  width: ${({ width }: { width: number }) => width}px;
`;
export const CardFlexStretch = styled.div`
  flex: 1;
  min-width: 0;
`;
