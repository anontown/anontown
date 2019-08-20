import { css } from "styled-components";
import { color, fontFamily, fontSize } from "../constant";

export const base = css`
  color: ${color.font};
  a {
    text-decoration: none;
    color: ${color.link};
  }
  a:hover {
    text-decoration: underline;
  }
`;

export const title = css`
  font-size: ${fontSize.title}px;
  font-family: ${fontFamily.title};
  a {
    color: ${color.font};
  }
`;

export const content = css`
  font-size: ${fontSize.content}px;
  font-family: ${fontFamily.content};
`;

export const sub = css`
  font-size: ${fontSize.sub}px;
  font-family: ${fontFamily.sub};
`;
