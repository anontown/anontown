import { IIpContainer } from "../../ports";

export class FixIpContainer implements IIpContainer {
  constructor(private ip: string) {}

  getIp(): string {
    return this.ip;
  }
}
