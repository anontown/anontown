import { FontIcon, IconButton } from "material-ui";
import * as React from "react";

import { useCounter } from "react-use";
import * as G from "../generated/graphql";
import { useInputCache } from "../hooks";
import { Storage, UserData, Sto } from "../domains/entities";
import { queryResultConvert } from "../utils";
import { CheckBox } from "./check-box";
import { Errors } from "./errors";
import { MdEditor } from "./md-editor";
import { Select } from "./select";
import { TextField } from "./text-field";
import { pipe } from "../prelude";

interface ResWriteProps {
  onSubmit?: (value: G.ResNormalFragment) => void;
  topic: string;
  reply: string | null;
  userData: UserData;
  changeStorage: (data: Storage) => void;
}

export const ResWrite = (props: ResWriteProps) => {
  function updateTopicWrite(f: (topicWrite: Sto.TopicWrite) => Sto.TopicWrite) {
    props.changeStorage(
      Sto.modifyTopicWrite(props.topic, f)(props.userData.storage),
    );
  }

  const data = Sto.getTopicWrite(props.topic)(props.userData.storage);

  const [errors, setErrors] = React.useState<Array<string>>([]);
  const [textCache, setTextCache] = useInputCache(
    Sto.getTopicWriteTextLens(props.reply).get(data),
    value => {
      updateTopicWrite(Sto.getTopicWriteTextLens(props.reply).set(value));
    },
  );

  const profiles = G.useFindProfilesQuery({
    variables: {
      query: {
        self: true,
      },
    },
  });
  queryResultConvert(profiles);

  const [mutation] = G.useCreateResMutation({
    variables: {
      topic: props.topic,
      name: pipe(data, Sto.topicWriteNameLens.get, name =>
        name.length !== 0 ? name : null,
      ),
      text: textCache,
      reply: props.reply,
      profile: Sto.topicWriteProfileLens.get(data),
      age: Sto.topicWriteAgeLens.get(data),
    },
  });

  const submit = () => {
    mutation()
      .then(x => {
        if (props.onSubmit !== undefined && x.data !== undefined) {
          props.onSubmit(x.data.createRes);
        }
        setErrors([]);
        setTextCache("");
      })
      .catch(() => {
        setErrors(["エラーが発生しました"]);
      });
  };

  const [
    focusCounter,
    { inc: incFocusCounter, dec: decFocusCounter },
  ] = useCounter(0);

  return (
    <form
      onFocus={() => {
        incFocusCounter();
      }}
      onBlur={() => {
        setTimeout(() => {
          decFocusCounter();
        }, 100);
      }}
    >
      <Errors errors={errors} />
      {focusCounter !== 0 || textCache.length !== 0 ? (
        <>
          <TextField
            style={{
              marginRight: "3px",
            }}
            placeholder="名前"
            value={Sto.topicWriteNameLens.get(data)}
            onChange={v => updateTopicWrite(Sto.topicWriteNameLens.set(v))}
          />
          {profiles.data !== undefined ? (
            <Select
              style={{
                marginRight: "3px",
                backgroundColor: "#fff",
              }}
              value={pipe(Sto.topicWriteProfileLens.get(data), x => x ?? "")}
              onChange={v => {
                updateTopicWrite(Sto.topicWriteProfileLens.set(v));
              }}
              options={[
                { value: "", text: "(プロフなし)" },
                ...profiles.data.profiles.map(p => ({
                  value: p.id,
                  text: `@${p.sn} ${p.name}`,
                })),
              ]}
            />
          ) : null}
          <CheckBox
            value={Sto.topicWriteAgeLens.get(data)}
            onChange={v => updateTopicWrite(Sto.topicWriteAgeLens.set(v))}
            label="Age"
          />
        </>
      ) : null}

      <MdEditor
        value={textCache}
        onChange={v => setTextCache(v)}
        maxRows={5}
        minRows={1}
        onKeyDown={e => {
          if ((e.shiftKey || e.ctrlKey) && e.keyCode === 13) {
            e.preventDefault();
            submit();
          }
        }}
        fullWidth={true}
        actions={
          <IconButton type="button" onClick={submit}>
            <FontIcon className="material-icons">send</FontIcon>
          </IconButton>
        }
      />
    </form>
  );
};
