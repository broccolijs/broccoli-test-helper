import * as t from "./interfaces";
import { joinPath, readDir, readFile, readTree, resolvePath } from "./util";

export default class ReadableDir implements t.ReadableDir {
  private dir: string;
  constructor(dir: string) {
    this.dir = resolvePath(dir);
  }

  public read(from?: string): t.Tree {
    return readTree(this.path(from));
  }

  public path(subpath?: string): string {
    const dir = this.dir;
    if (subpath === undefined) {
      return dir;
    }
    const path = joinPath(dir, subpath);
    if (!path.startsWith(dir)) {
      throw new Error("subpath should not escape directory");
    }
    return path;
  }

  public readBinary(subpath: string): Buffer | undefined {
    return readFile(this.path(subpath));
  }

  public readText(subpath: string, encoding?: string): string | undefined {
    return readFile(this.path(subpath), encoding || "utf8");
  }

  public readDir(
    subpath?: string,
    options?: t.ReadDirOptions
  ): string[] | undefined {
    return readDir(this.path(subpath), options);
  }
}
