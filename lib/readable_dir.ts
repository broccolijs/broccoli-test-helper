import { join, resolve } from "path";
import { readSync } from "./fixturify";
import * as t from "./interfaces";

export default class ReadableDir implements t.ReadableDir {
  private dir: string;
  constructor(dir: string) {
    this.dir = resolve(dir);
  }

  public read(from?: string): t.Tree {
    return readSync(this.path(from));
  }

  public path(subpath?: string): string {
    let dir = this.dir;
    return subpath ? join(dir, subpath) : dir;
  }
}
