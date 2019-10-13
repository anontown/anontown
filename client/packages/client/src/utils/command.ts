import * as Im from "immutable";

export class Command<T> {
  static fromValue<T>(val: T) {
    return new Command(Im.List<T>([val]), 0);
  }

  constructor(
    private readonly history: Im.List<T>,
    private readonly index: number,
  ) {}

  get value(): T {
    return this.history.get(this.index)!;
  }

  undo(): Command<T> {
    if (this.index === 0) {
      return this;
    } else {
      return new Command(this.history, this.index - 1);
    }
  }

  redo(): Command<T> {
    if (this.index === this.history.size - 1) {
      return this;
    } else {
      return new Command(this.history, this.index + 1);
    }
  }

  change(val: T) {
    return new Command(
      this.history
        .slice(0, this.index + 1)
        .toList()
        .push(val),
      this.index + 1,
    );
  }
}
