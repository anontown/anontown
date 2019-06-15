import { FontIcon, IconButton } from "material-ui";
import * as React from "react";
import { Rnd } from "react-rnd";
import { Link } from "react-router-dom";
import { Config } from "../env";
import {
  camo,
  mdParser,
  safeURL,
} from "../utils";
import * as style from "./md.scss";
import { Modal } from "./modal";

type URLType = { type: "normal", url: string } |
{ type: "router", path: string } |
{ type: "youtube", videoID: string } |
{ type: "image", url: string };

export interface MdProps {
  text: string;
}

export function Md(props: MdProps) {
  const node = mdParser.parse(props.text);
  return React.createElement("div", {
    style: {
      padding: "2px",
    },
    className: style.md,
  },
    // tslint:disable-next-line:jsx-key
    ...node.children.map(c => <MdNode node={c} />));
}

interface MdYouTubeProps {
  title?: string;
  videoID: string;
}

class MdYouTube extends React.Component<MdYouTubeProps, { slow: boolean }> {
  constructor(props: MdYouTubeProps) {
    super(props);
    this.state = {
      slow: false,
    };
  }

  render() {
    return (
      <>
        <img
          className={style.preview}
          src={`https://i.ytimg.com/vi/${this.props.videoID}/maxresdefault.jpg`}
          title={this.props.title || undefined}
          onClick={() => this.setState({ slow: true })}
        />
        {this.state.slow
          ? <Rnd
            default={{
              x: 0,
              y: 0,
              width: window.innerWidth / 3 * 2,
              height: window.innerWidth / 3,
            }}
            style={{
              backgroundColor: "#555",
            }}
          >
            <IconButton type="button" onClick={() => this.setState({ slow: false })} >
              <FontIcon className="material-icons">close</FontIcon>
            </IconButton>
            <div className={style.youtube}>
              <iframe
                src={`https://www.youtube.com/embed/${this.props.videoID}`}
                frameBorder="0"
              />
            </div>
          </Rnd>
          : null}
      </>
    );
  }
}

function urlEnum(url: string): URLType {
  const reg = url.match(/(youtube\.com\/watch\?v=|youtu\.be\/)([a-z0-9_]+)/i);
  if (reg) {
    return { type: "youtube", videoID: reg[2] };
  }

  if (url.indexOf("http://") !== 0 && url.indexOf("https://") !== 0) {
    return {
      type: "router",
      path: url,
    };
  }

  if (url.indexOf(Config.client.origin) === 0) {
    return {
      type: "router",
      path: url.substring(Config.client.origin.length),
    };
  }

  if (url.match(/\.(jpg|jpeg|png|gif|bmp|tif|tiff|svg)$/i)) {
    return { type: "image", url };
  }

  return { type: "normal", url };
}

function MdLink(props: { node: mdParser.Link }) {
  const link = urlEnum(props.node.url);
  switch (link.type) {
    case "normal":
      return React.createElement("a", {
        href: safeURL(props.node.url),
        target: "_blank",
        title: props.node.title || undefined,
        // tslint:disable-next-line:jsx-key
      }, ...props.node.children.map(c => <MdNode node={c} />));
    case "image":
      return (
        <MdImg
          url={safeURL(props.node.url)}
          title={props.node.title || undefined}
        />
      );
    case "youtube":
      return <MdYouTube videoID={link.videoID} title={props.node.title || undefined} />;
    case "router":
      return React.createElement(Link, {
        to: link.path,
        // tslint:disable-next-line:jsx-key
      }, ...props.node.children.map(c => <MdNode node={c} />));
  }
}

function MdHeading(props: { node: mdParser.Heading }) {
  return React.createElement(`h${props.node.depth}`, {},
    // tslint:disable-next-line:jsx-key
    ...props.node.children.map(c => <MdNode node={c} />));
}

function MdTable(props: { node: mdParser.Table }) {
  const head = props.node.children[0];

  return (
    <table>
      <thead>
        {React.createElement("tr", {}, ...head.type === "tableRow"
          ? head.children.map((cell, index) =>
            React.createElement("th", {
              style: {
                textAlign: props.node.align[index],
              },
            }, ...cell.type === "tableCell"
              // tslint:disable-next-line:jsx-key
              ? cell.children.map(c => <MdNode node={c} />)
              : []))
          : [])}
      </thead>
      {React.createElement("tbody", {}, ...props.node.children
        .filter((_, i) => i !== 0)
        .map(row => row.type === "tableRow"
          ? React.createElement("tr", {}, ...row.children.map((cell, index) => cell.type === "tableCell"
            ? React.createElement("td", {
              style: {
                textAlign: props.node.align[index],
              },
              // tslint:disable-next-line:jsx-key
            }, ...cell.children.map(c => <MdNode node={c} />))
            : []))
          : []))}
    </table>
  );
}

class MdNode extends React.Component<{ node: mdParser.MdNode }, {}> {
  render(): React.ReactNode {
    switch (this.props.node.type) {
      case "paragraph":
        return React.createElement("p", {}
          // tslint:disable-next-line:jsx-key
          , ...this.props.node.children.map(c => <MdNode node={c} />));
      case "blockquote":
        return React.createElement("blockquote", {}
          // tslint:disable-next-line:jsx-key
          , ...this.props.node.children.map(c => <MdNode node={c} />));
      case "heading":
        return <MdHeading node={this.props.node} />;
      case "code":
        return (
          <pre>
            <code>{this.props.node.value}</code>
          </pre>
        );
      case "inlineCode":
        return <code>{this.props.node.value}</code>;
      case "list":
        if (this.props.node.ordered) {
          return React.createElement("ol", {}
            // tslint:disable-next-line:jsx-key
            , ...this.props.node.children.map(c => <MdNode node={c} />));
        } else {
          return React.createElement("ul", {}
            // tslint:disable-next-line:jsx-key
            , ...this.props.node.children.map(c => <MdNode node={c} />));
        }
      case "listItem":
        return React.createElement("li", {}
          // tslint:disable-next-line:jsx-key
          , ...this.props.node.children.map(c => <MdNode node={c} />));
      case "table":
        return <MdTable node={this.props.node} />;
      case "thematicBreak":
        return <hr />;
      case "break":
        return <br />;
      case "emphasis":
        return React.createElement("em", {}
          // tslint:disable-next-line:jsx-key
          , ...this.props.node.children.map(c => <MdNode node={c} />));
      case "strong":
        return React.createElement("strong", {}
          // tslint:disable-next-line:jsx-key
          , ...this.props.node.children.map(c => <MdNode node={c} />));
      case "delete":
        return React.createElement("del", {}
          // tslint:disable-next-line:jsx-key
          , ...this.props.node.children.map(c => <MdNode node={c} />));
      case "link":
        return <MdLink node={this.props.node} />;
      case "image":
        return (
          <MdImg
            url={camo.getCamoUrl(this.props.node.url)}
            title={this.props.node.title || undefined}
            alt={this.props.node.alt || undefined}
          />
        );
      case "text":
        return this.props.node.value;
      default:
        return null;
    }
  }
}

interface MdImgProps {
  url: string;
  title?: string;
  alt?: string;
}

interface MdImgState {
  dialog: boolean;
}

class MdImg extends React.Component<MdImgProps, MdImgState> {
  constructor(props: MdImgProps) {
    super(props);
    this.state = {
      dialog: false,
    };
  }

  render() {
    return (
      <>
        <img
          className={style.preview}
          src={camo.getCamoUrl(this.props.url)}
          title={this.props.title}
          alt={this.props.alt}
          onClick={() => this.setState({ dialog: true })}
        />
        <Modal
          isOpen={this.state.dialog}
          onRequestClose={() => this.setState({ dialog: false })}
        >
          <img
            style={{
              width: "50vw",
              height: "auto",
            }}
            src={camo.getCamoUrl(this.props.url)}
            title={this.props.title}
            alt={this.props.alt}
            onClick={() => this.setState({ dialog: true })}
          />
        </Modal>
      </>
    );
  }
}
