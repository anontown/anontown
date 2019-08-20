import { IClock } from "../../ports";

export class FixClock implements IClock {
  constructor(private _now: Date) {}

  now(): Date {
    return this._now;
  }
}
