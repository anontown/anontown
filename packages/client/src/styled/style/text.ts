import { color, fontFamily, fontSize } from "../constant";
import { css } from "styled-components";

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
  font-size: ${fontSize.title};
  font-family: ${fontFamily.title};
  a {
    color: ${color.font};
  }
`;

export const content = css`
  font-size: ${fontSize.content};
  font-family: ${fontFamily.content};
`;

export const sub = css`
  font-size: ${fontSize.sub};
  font-family: ${fontFamily.sub};
`;
