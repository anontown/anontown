import { AutoComplete, MenuItem } from "material-ui";
import * as React from "react";
import * as G from "../generated/graphql";
import { Snack } from "./snack";
import * as style from "./tags-input.scss";
import { RA } from "../prelude";

export interface TagsInputProps {
  value: ReadonlyArray<string>;
  onChange?: (value: ReadonlyArray<string>) => void;
  fullWidth?: boolean;
}

interface TagsInputState {
  inputValue: string;
  open: boolean;
}

export class TagsInput extends React.Component<TagsInputProps, TagsInputState> {
  constructor(props: TagsInputProps) {
    super(props);
    this.state = {
      inputValue: "",
      open: false,
    };
  }

  addTag() {
    if (this.state.inputValue.length !== 0) {
      this.props.onChange?.(RA.snoc(this.props.value, this.state.inputValue));
      this.setState({ inputValue: "" });
    }
  }

  render() {
    return (
      <>
        <div>
          {this.props.value.map(t => (
            <span key={t} className={style.tag}>
              <span
                className={style.tagButton}
                onClick={() => {
                  this.props.onChange?.(this.props.value.filter(x => x !== t));
                }}
              >
                ×
              </span>
              {t}
            </span>
          ))}
        </div>
        <G.FindTopicTagsComponent>
          {({ loading, error, data }) => {
            if (loading) {
              return <span>Loading...</span>;
            }
            if (error || !data) {
              return <Snack msg="タグ候補取得に失敗しました" />;
            }

            return (
              <AutoComplete
                fullWidth={this.props.fullWidth}
                floatingLabelText="タグ"
                dataSource={data.topicTags.map(t => ({
                  text: t.name,
                  value: (
                    <MenuItem
                      primaryText={t.name}
                      secondaryText={t.count.toString()}
                    />
                  ),
                }))}
                open={this.state.open}
                filter={(text, key) =>
                  key.toLowerCase().includes(text.toLowerCase()) &&
                  !this.props.value.includes(key)
                }
                searchText={this.state.inputValue}
                onUpdateInput={v => this.setState({ inputValue: v })}
                onKeyDown={e => {
                  // エンター/半角スペ
                  if (e.keyCode === 13 || e.keyCode === 32) {
                    e.preventDefault();
                    this.addTag();
                  }
                }}
                onNewRequest={() => this.addTag()}
                onFocus={() => this.setState({ open: true })}
                {...{ onClose: () => this.setState({ open: false }) }}
                onBlur={() => {
                  setTimeout(() => {
                    if (!this.state.open) {
                      this.addTag();
                    }
                  }, 0);
                }}
                listStyle={{
                  maxHeight: "30vh",
                  overflow: "auto",
                }}
              />
            );
          }}
        </G.FindTopicTagsComponent>
      </>
    );
  }
}
