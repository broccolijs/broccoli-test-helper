import { FSTree } from "fs-tree-diff";
import { Changes } from "./interfaces";
import { diffEntries, readEntries } from "./util";

export default class TreeDiff {
  public changes: Changes = {};
  private previous: FSTree | undefined = undefined;
  constructor(private path: string) {}

  public recompute(): void {
    const previous = this.previous;
    const current = readEntries(this.path);
    this.changes = diffEntries(current, previous);
    this.previous = current;
  }
}
