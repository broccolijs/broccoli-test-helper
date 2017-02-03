import { join } from "path";
import * as rsvp from "rsvp";
import * as rimraf from "rimraf";
import { writeSync, readSync } from "./fixturify";
import * as t from "./interfaces";

export default class TempDir implements t.TempDir {
  constructor(private tmpdir: string) {
  }

  write(content: t.Tree, to?: string): void {
    writeSync(this.path(to), content);
  }

  copy(from: string, to?: string): void {
    writeSync(this.path(to), readSync(from));
  }

  read(from?: string): t.Tree {
    return readSync(this.path(from));
  }

  path(subpath?: string): string {
    let tmpdir = this.tmpdir;
    return subpath ? join(tmpdir, subpath) : tmpdir;
  }

  dispose(): rsvp.Promise<void> {
    return new rsvp.Promise<void>((resolve, reject) => {
      rimraf(this.tmpdir, (err) => {
        err ? reject(err) : resolve();
      });
    });
  }
}
