import { option } from "fp-ts";
import { pipe } from "fp-ts/lib/pipeable";
import { IIpContainer } from "./ports/index";

export function mutation(ipContainer: IIpContainer, name: string, id: string) {
  return `${pipe(
    ipContainer.getIp(),
    option.getOrElse(() => "<unknown_ip>"),
  )} ${name} ${id}`;
}
