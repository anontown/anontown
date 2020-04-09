import * as breaks from "remark-breaks";
import * as markdown from "remark-parse";
import * as unified from "unified";

export function parse(text: string): Root {
  return unified().use(markdown).use(breaks).parse(text);
}

export type MdNode =
  | Paragraph
  | Blockquote
  | Heading
  | Code
  | InlineCode
  | List
  | ListItem
  | Table
  | TableRow
  | TableCell
  | ThematicBreak
  | Break
  | Emphasis
  | Strong
  | Delete
  | Link
  | Image
  | Text;

interface ParentBase {
  children: MdNode[];
}

interface TextBase {
  value: string;
}

export interface Root extends ParentBase {
  type: "root";
}

export interface Paragraph extends ParentBase {
  type: "paragraph";
}

export interface Blockquote extends ParentBase {
  type: "blockquote";
}

export interface Heading extends ParentBase {
  type: "heading";
  depth: 1 | 2 | 3 | 4 | 5 | 6;
}

export interface Code extends TextBase {
  type: "code";
  lang: string | null;
}

export interface InlineCode extends TextBase {
  type: "inlineCode";
}

export interface List extends ParentBase {
  type: "list";
  ordered: boolean;
  start: number | null;
  loose: boolean;
}

export interface ListItem extends ParentBase {
  type: "listItem";
  loose: boolean;
  checked: boolean | null;
}

export interface Table extends ParentBase {
  type: "table";
  align: ("left" | "right" | "center" | null)[];
}

export interface TableRow extends ParentBase {
  type: "tableRow";
}

export interface TableCell extends ParentBase {
  type: "tableCell";
}

export interface ThematicBreak {
  type: "thematicBreak";
}

export interface Break {
  type: "break";
}

export interface Emphasis extends ParentBase {
  type: "emphasis";
}

export interface Strong extends ParentBase {
  type: "strong";
}

export interface Delete extends ParentBase {
  type: "delete";
}

export interface Link extends ParentBase {
  type: "link";
  title: string | null;
  url: string;
}

export interface Image {
  type: "image";
  title: string | null;
  alt: string | null;
  url: string;
}

export interface Text extends TextBase {
  type: "text";
}
