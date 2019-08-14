import { color } from "../constant";
import { title, content, sub } from "./font";
import { css } from "styled-components";

export const text = css`
  color: ${color.font};
  a {
    text-decoration: none;
    color: ${({ font }: { font: "title" | "content" | "sub" }) =>
      font !== "title" ? color.link : color.font};
  }
  a:hover {
    text-decoration: underline;
  }
  ${({ font }: { font: "title" | "content" | "sub" }) => {
    switch (font) {
      case "title":
        return title;
      case "content":
        return content;
      case "sub":
        return sub;
    }
  }}
`;
