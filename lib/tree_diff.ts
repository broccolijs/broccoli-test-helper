import { ChangeOp, Changes } from "./interfaces";

const walkSync: {
  entries(path: string): Entry[];
} = require("walk-sync");
const FSTree: {
  fromEntries(entries: Entry[]): FSTree;
} = require("fs-tree-diff");

export default class TreeDiff {
  public changes: Changes;

  private last: FSTree;
  private current: FSTree;

  constructor(private path: string) {
    this.last = FSTree.fromEntries([]);
    this.current = FSTree.fromEntries([]);
    this.changes = {};
  }

  public recompute(): void {
    let last = this.last = this.current;
    let current = this.current = FSTree.fromEntries(walkSync.entries(this.path));
    let changes: Changes = this.changes = {};
    let patch = last.calculatePatch(current);
    for (let i = 0; i < patch.length; i++) {
      let op = patch[i][0];
      let path = patch[i][1];
      changes[path] = op;
    }
  }
}

interface Entry {
  relativePath: string;
  basePath: string;
  fullPath: string;
  mode: number;
  size: number;
  mtime: Date;
  isDirectory(): boolean;
}

interface FSTree {
  calculatePatch(next: FSTree): Array<[ChangeOp, string, Entry]>;
}
