import * as rsvp from "rsvp";
import { join } from "path";
import * as t from "./interfaces";
import TreeDiff from "./tree_diff";
import { readSync } from "./fixturify";

export default class Output implements t.Output {
  private treeDiff: TreeDiff;

  constructor(public builder: t.Builder) {
    this.treeDiff = new TreeDiff(builder.outputPath);
  }

  read(from?: string): t.Tree {
    return readSync(this.path(from));
  }

  path(subpath?: string): string {
    let outputPath = this.builder.outputPath;
    return subpath ? join(outputPath, subpath) : outputPath;
  }

  changes(): t.Changes {
    return this.treeDiff.changes;
  }

  rebuild(): rsvp.Promise<void> {
    return this.builder.build().then(() => {
      this.treeDiff.recompute();
    });
  }

  dispose(): rsvp.Promise<void> {
    return rsvp.Promise.resolve(this.builder.cleanup());
  }
}
