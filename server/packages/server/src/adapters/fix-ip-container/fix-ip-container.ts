import { Option } from "fp-ts/lib/Option";
import { IIpContainer } from "../../ports";

export class FixIpContainer implements IIpContainer {
  constructor(private ip: Option<string>) {}

  getIp(): Option<string> {
    return this.ip;
  }
}
