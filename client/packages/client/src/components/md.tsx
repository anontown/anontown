import { FontIcon, IconButton } from "material-ui";
import * as React from "react";
import { Rnd } from "react-rnd";
import { Link } from "react-router-dom";
import { mdParser, safeURL } from "../utils";
import { camo } from "../effects";

import * as style from "./md.scss";
import { Modal } from "./modal";

// TODO: ここに置くべきではない。DIできるべき
const CLIENT_ORIGIN = location.origin;

type URLType =
  | { type: "normal"; url: string }
  | { type: "router"; path: string }
  | { type: "youtube"; videoID: string }
  | { type: "image"; url: string };

export interface MdProps {
  text: string;
}

export function Md(props: MdProps) {
  const node = React.useMemo(() => mdParser.parse(props.text), [props.text]);
  return React.createElement(
    "div",
    {
      style: {
        padding: "2px",
      },
      className: style.md,
    },
    // eslint-disable-next-line react/jsx-key
    ...node.children.map(c => <MdNode node={c} />),
  );
}

interface MdYouTubeProps {
  title?: string;
  videoID: string;
}

function MdYouTube(props: MdYouTubeProps) {
  const [slow, setSlow] = React.useState(false);

  return (
    <>
      <img
        className={style.preview}
        src={`https://i.ytimg.com/vi/${props.videoID}/maxresdefault.jpg`}
        title={props.title || undefined}
        onClick={() => setSlow(true)}
      />
      {slow ? (
        <Rnd
          default={{
            x: 0,
            y: 0,
            width: (window.innerWidth / 3) * 2,
            height: window.innerWidth / 3,
          }}
          style={{
            backgroundColor: "#555",
          }}
        >
          <IconButton type="button" onClick={() => setSlow(false)}>
            <FontIcon className="material-icons">close</FontIcon>
          </IconButton>
          <div className={style.youtube}>
            <iframe
              src={`https://www.youtube.com/embed/${props.videoID}`}
              frameBorder="0"
            />
          </div>
        </Rnd>
      ) : null}
    </>
  );
}

function urlEnum(url: string): URLType {
  const reg = /(youtube\.com\/watch\?v=|youtu\.be\/)([a-z0-9_]+)/i.exec(url);
  if (reg) {
    return { type: "youtube", videoID: reg[2] };
  }

  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    return {
      type: "router",
      path: url,
    };
  }

  if (url.startsWith(CLIENT_ORIGIN)) {
    return {
      type: "router",
      path: url.substring(CLIENT_ORIGIN.length),
    };
  }

  if (/\.(jpg|jpeg|png|gif|bmp|tif|tiff|svg)$/i.test(url)) {
    return { type: "image", url };
  }

  return { type: "normal", url };
}

function MdLink(props: { node: mdParser.Link }) {
  const link = urlEnum(props.node.url);
  switch (link.type) {
    case "normal":
      return React.createElement(
        "a",
        {
          href: safeURL(props.node.url),
          target: "_blank",
          title: props.node.title || undefined,
          rel: "noopener noreferrer",
        },
        // eslint-disable-next-line react/jsx-key
        ...props.node.children.map(c => <MdNode node={c} />),
      );
    case "image":
      return (
        <MdImg
          url={safeURL(props.node.url)}
          title={props.node.title || undefined}
        />
      );
    case "youtube":
      return (
        <MdYouTube
          videoID={link.videoID}
          title={props.node.title || undefined}
        />
      );
    case "router":
      return React.createElement(
        Link,
        {
          to: link.path,
        },
        // eslint-disable-next-line react/jsx-key
        ...props.node.children.map(c => <MdNode node={c} />),
      );
  }
}

function MdHeading(props: { node: mdParser.Heading }) {
  return React.createElement(
    `h${props.node.depth}`,
    {},
    // eslint-disable-next-line react/jsx-key
    ...props.node.children.map(c => <MdNode node={c} />),
  );
}

function MdTable(props: { node: mdParser.Table }) {
  const head = props.node.children[0];

  return (
    <table>
      <thead>
        {React.createElement(
          "tr",
          {},
          ...(head.type === "tableRow"
            ? head.children.map((cell, index) =>
              React.createElement(
                "th",
                {
                  style: {
                    textAlign: props.node.align[index],
                  },
                },
                ...(cell.type === "tableCell"
                  ? // eslint-disable-next-line react/jsx-key
                  cell.children.map(c => <MdNode node={c} />)
                  : []),
              ),
            )
            : []),
        )}
      </thead>
      {React.createElement(
        "tbody",
        {},
        ...props.node.children
          .filter((_, i) => i !== 0)
          .map(row =>
            row.type === "tableRow"
              ? React.createElement(
                "tr",
                {},
                ...row.children.map((cell, index) =>
                  cell.type === "tableCell"
                    ? React.createElement(
                      "td",
                      {
                        style: {
                          textAlign: props.node.align[index],
                        },
                      },
                      // eslint-disable-next-line react/jsx-key
                      ...cell.children.map(c => <MdNode node={c} />),
                    )
                    : [],
                ),
              )
              : [],
          ),
      )}
    </table>
  );
}

function MdNode(props: { node: mdParser.MdNode }): JSX.Element {
  switch (props.node.type) {
    case "paragraph":
      return React.createElement(
        "p",
        {},
        // eslint-disable-next-line react/jsx-key
        ...props.node.children.map(c => <MdNode node={c} />),
      );
    case "blockquote":
      return React.createElement(
        "blockquote",
        {},
        // eslint-disable-next-line react/jsx-key
        ...props.node.children.map(c => <MdNode node={c} />),
      );
    case "heading":
      return <MdHeading node={props.node} />;
    case "code":
      return (
        <pre>
          <code>{props.node.value}</code>
        </pre>
      );
    case "inlineCode":
      return <code>{props.node.value}</code>;
    case "list":
      if (props.node.ordered) {
        return React.createElement(
          "ol",
          {},
          // eslint-disable-next-line react/jsx-key
          ...props.node.children.map(c => <MdNode node={c} />),
        );
      } else {
        return React.createElement(
          "ul",
          {},
          // eslint-disable-next-line react/jsx-key
          ...props.node.children.map(c => <MdNode node={c} />),
        );
      }
    case "listItem":
      return React.createElement(
        "li",
        {},
        // eslint-disable-next-line react/jsx-key
        ...props.node.children.map(c => <MdNode node={c} />),
      );
    case "table":
      return <MdTable node={props.node} />;
    case "thematicBreak":
      return <hr />;
    case "break":
      return <br />;
    case "emphasis":
      return React.createElement(
        "em",
        {},
        // eslint-disable-next-line react/jsx-key
        ...props.node.children.map(c => <MdNode node={c} />),
      );
    case "strong":
      return React.createElement(
        "strong",
        {},
        // eslint-disable-next-line react/jsx-key
        ...props.node.children.map(c => <MdNode node={c} />),
      );
    case "delete":
      return React.createElement(
        "del",
        {},
        // eslint-disable-next-line react/jsx-key
        ...props.node.children.map(c => <MdNode node={c} />),
      );
    case "link":
      return <MdLink node={props.node} />;
    case "image":
      return (
        <MdImg
          url={camo.getCamoUrl(props.node.url)}
          title={props.node.title || undefined}
          alt={props.node.alt || undefined}
        />
      );
    case "text":
      return <>{props.node.value}</>;
    default:
      return <></>;
  }
}

interface MdImgProps {
  url: string;
  title?: string;
  alt?: string;
}

function MdImg(props: MdImgProps) {
  const [dialog, setDialog] = React.useState(false);

  return (
    <>
      <img
        className={style.preview}
        src={camo.getCamoUrl(props.url)}
        title={props.title}
        alt={props.alt}
        onClick={() => setDialog(true)}
      />
      <Modal isOpen={dialog} onRequestClose={() => setDialog(false)}>
        <img
          style={{
            width: "50vw",
            height: "auto",
          }}
          src={camo.getCamoUrl(props.url)}
          title={props.title}
          alt={props.alt}
          onClick={() => setDialog(true)}
        />
      </Modal>
    </>
  );
}
