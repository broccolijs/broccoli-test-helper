import { Changes } from "./interfaces";
import { diffEntries, FSTree, readEntries } from "./util";

export default class TreeDiff {
  public changes: Changes = {};
  private previous: FSTree | undefined = undefined;
  constructor(private path: string) {}

  public recompute(): void {
    let previous = this.previous;
    let current = readEntries(this.path);
    this.changes = diffEntries(current, previous);
    this.previous = current;
  }
}
