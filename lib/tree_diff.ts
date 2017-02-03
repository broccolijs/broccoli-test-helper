import { Change } from "./interfaces";

const walkSync: WalkSync = require("walk-sync");
const FSTree: FSTree.Static = require("fs-tree-diff");

interface WalkSync {
  entries(path: string, options?: WalkSync.Options): WalkSync.Entry[];
}

namespace WalkSync {
  export type Options = {
    globs?: (string | { match(): boolean })[];
  };

  export interface Entry {
    relativePath: string;
    basePath: string;
    fullPath: string;
    mode: number;
    size: number;
    mtime: Date;
    isDirectory(): boolean;
  }
}

interface FSTree {
  calculatePatch(next: FSTree, isUnchanged?: (a: WalkSync.Entry, b: WalkSync.Entry) => {}): FSTree.PatchOp[];
}

namespace FSTree {
  export type Op = "unlink" | "create" | "mkdir" | "rmdir" | "change";

  export type PatchOp = [Op, string, WalkSync.Entry];

  export interface Static {
    fromEntries(entries: WalkSync.Entry[], options?: {
      sortAndExpand?: boolean
    }): FSTree;
  }
}

export default class TreeDiff {
  private last: FSTree;
  private current: FSTree;
  public changes: Change[];

  constructor(private path: string) {
    this.last = FSTree.fromEntries([]);
    this.current = FSTree.fromEntries([]);
    this.changes = [];
    this.recompute();
  }

  recompute(): void {
    let last = this.last = this.current;
    let current = this.current = FSTree.fromEntries(walkSync.entries(this.path));
    let changes = this.changes;
    changes.length = 0;
    let patch = last.calculatePatch(current);
    for (let i = 0; i < patch.length; i++) {
      changes.push({
        type: patch[i][0],
        path: patch[i][1]
      });
    }
  }
}
