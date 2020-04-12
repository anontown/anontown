import { FontIcon, IconButton, MenuItem } from "material-ui";
import * as React from "react";
import * as rx from "rxjs";
import * as op from "rxjs/operators";
import { imgur } from "../effects";
import { Errors } from "./errors";
import { Md } from "./md";
import { Modal } from "./modal";
import { Oekaki } from "./oekaki";
import { PopupMenu } from "./popup-menu";
import { TextArea } from "./text-area";

export interface MdEditorProps {
  value: string;
  maxRows?: number;
  minRows?: number;
  onChange?: (newValue: string) => void;
  fullWidth?: boolean;
  onKeyPress?: React.KeyboardEventHandler<{}>;
  onKeyDown?: React.KeyboardEventHandler<{}>;
  actions?: React.ReactNode;
  onChangeFocus?: (isFocus: boolean) => void;
}

interface MdEditorState {
  oekakiErrors?: Array<string>;
  imageErrors?: Array<string>;
  slowOekaki: boolean;
  slowImage: boolean;
  showPreview: boolean;
}

export class MdEditor extends React.Component<MdEditorProps, MdEditorState> {
  defaltMinRows = 5;

  constructor(props: MdEditorProps) {
    super(props);
    this.state = {
      slowOekaki: false,
      slowImage: false,
      showPreview: false,
    };
  }

  upload(datas: Array<FormData>) {
    rx.of(...datas)
      .pipe(
        op.mergeMap(form => imgur.upload(form)),
        op.map(url => `![](${url})`),
        op.reduce((tags, tag) => tags + tag + "\n", ""),
      )
      .subscribe(
        tags => {
          this.setState({ slowImage: false, oekakiErrors: undefined });
          if (this.props.onChange) {
            this.props.onChange(this.props.value + tags);
          }
        },
        () => {
          this.setState({ imageErrors: ["アップロードに失敗しました"] });
        },
      );
  }

  render() {
    return (
      <div
        onPaste={e => {
          const items = e.clipboardData.items;
          const datas = Array.from(items)
            .filter(x => x.type.includes("image"))
            .map(x => x.getAsFile())
            .filter<File>((x): x is File => x !== null)
            .map(x => {
              const data = new FormData();
              data.append("image", x, "image.png");
              return data;
            });
          this.upload(datas);
        }}
      >
        <Modal
          isOpen={this.state.slowOekaki}
          onRequestClose={() => this.setState({ slowOekaki: false })}
        >
          <h1>お絵かき</h1>
          <Errors errors={this.state.oekakiErrors} />
          <Oekaki
            size={{ x: 320, y: 240 }}
            onSubmit={data => this.upload([data])}
          />
        </Modal>
        <Modal
          isOpen={this.state.slowImage}
          onRequestClose={() => this.setState({ slowImage: false })}
        >
          <h1>画像アップロード</h1>
          <Errors errors={this.state.imageErrors} />
          <input
            type="file"
            onChange={e => {
              const target = e.target as HTMLInputElement;
              const files = target.files;
              if (files !== null) {
                const datas = Array.from(files).map(file => {
                  const formData = new FormData();
                  formData.append("image", file);
                  return formData;
                });
                this.upload(datas);
              }
            }}
          />
        </Modal>
        <Modal
          isOpen={this.state.showPreview}
          onRequestClose={() => this.setState({ showPreview: false })}
        >
          <h1>プレビュー</h1>
          <Md text={this.props.value} />
        </Modal>
        <div style={{ display: "flex" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <PopupMenu
              trigger={
                <IconButton touch={true}>
                  <FontIcon className="material-icons">menu</FontIcon>
                </IconButton>
              }
              position="top left"
            >
              <MenuItem
                primaryText="プレビュー"
                onClick={() =>
                  this.setState({ showPreview: !this.state.showPreview })
                }
              />
              <MenuItem
                primaryText="画像"
                onClick={() =>
                  this.setState({ slowImage: !this.state.slowImage })
                }
              />
              <MenuItem
                primaryText="お絵かき"
                onClick={() =>
                  this.setState({ slowOekaki: !this.state.slowOekaki })
                }
              />
            </PopupMenu>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              width: "100%",
            }}
          >
            <TextArea
              rows={this.props.minRows || this.defaltMinRows}
              rowsMax={this.props.maxRows || this.defaltMinRows}
              value={this.props.value}
              onChange={v => {
                if (this.props.onChange) {
                  this.props.onChange(v);
                }
              }}
              onKeyPress={this.props.onKeyPress}
              onKeyDown={this.props.onKeyDown}
              style={{
                backgroundColor: "#fff",
                outline: "none",
                resize: "none",
                border: "solid 1px #ccc",
              }}
              onFocus={() => {
                if (this.props.onChangeFocus) {
                  this.props.onChangeFocus(true);
                }
              }}
              onBlur={() => {
                if (this.props.onChangeFocus) {
                  this.props.onChangeFocus(false);
                }
              }}
            />
          </div>
          {this.props.actions !== undefined ? (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              {this.props.actions}
            </div>
          ) : null}
        </div>
      </div>
    );
  }
}
