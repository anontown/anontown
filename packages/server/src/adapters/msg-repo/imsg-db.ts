import { option } from "fp-ts";
import { fromNullable } from "fp-ts/lib/Option";
import { Msg } from "../../entities";

export interface IMsgDB {
  readonly id: string;
  readonly body: {
    readonly receiver: string | null;
    readonly text: string;
    readonly date: string;
  };
}

export function toMsg(m: IMsgDB): Msg {
  return new Msg(
    m.id,
    fromNullable(m.body.receiver),
    m.body.text,
    new Date(m.body.date),
  );
}

export function fromMsg(msg: Msg): IMsgDB {
  return {
    id: msg.id,
    body: {
      receiver: option.toNullable(msg.receiver),
      text: msg.text,
      date: msg.date.toISOString(),
    },
  };
}
