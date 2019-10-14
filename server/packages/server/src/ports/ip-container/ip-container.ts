import { Option } from "fp-ts/lib/Option";

export interface IIpContainer {
  getIp(): Option<string>;
}
