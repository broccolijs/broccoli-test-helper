import * as t from "./interfaces";
import ReadableDir from "./readable_dir";
import TreeDiff from "./tree_diff";
import { readTree, removeDir, writeTree } from "./util";

export default class TempDir extends ReadableDir implements t.TempDir {
  private treeDiff: TreeDiff;

  constructor(dir: string) {
    super(dir);
    this.treeDiff = new TreeDiff(dir);
  }

  public changes(): t.Changes {
    const treeDiff = this.treeDiff;
    treeDiff.recompute();
    return treeDiff.changes;
  }

  public write(content: t.Tree, to?: string): void {
    writeTree(this.path(to), content);
  }

  public copy(from: string, to?: string): void {
    writeTree(this.path(to), readTree(from));
  }

  public dispose(): Promise<void> {
    return removeDir(this.path());
  }
}
