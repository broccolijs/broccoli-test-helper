import { join } from "path";
import { readSync } from "./fixturify";
import * as t from "./interfaces";
import TreeDiff from "./tree_diff";

export default class Output implements t.Output {
  private treeDiff: TreeDiff;

  constructor(public builder: t.Builder) {
    this.treeDiff = new TreeDiff(builder.outputPath);
  }

  public read(from?: string): t.Tree {
    return readSync(this.path(from));
  }

  public path(subpath?: string): string {
    let outputPath = this.builder.outputPath;
    return subpath ? join(outputPath, subpath) : outputPath;
  }

  public changes(): t.Changes {
    return this.treeDiff.changes;
  }

  public build(): Promise<void> {
    return this.builder.build().then(() => {
      this.treeDiff.recompute();
    });
  }

  /**
   * @deprecated
   */
  public rebuild(): Promise<t.Output> {
    console.warn(`rebuilt() is deprecated, just call build() any.`);
    return this.build().then(() => this);
  }

  public dispose(): Promise<void> {
    return Promise.resolve(this.builder.cleanup());
  }
}
