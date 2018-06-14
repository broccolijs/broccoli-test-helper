import * as t from "./interfaces";
import ReadableDir from "./readable_dir";
import { readTree, removeDir, writeFile, writeTree } from "./util";

export default class TempDir extends ReadableDir implements t.TempDir {
  constructor(dir: string) {
    super(dir);
    // start change tracking
    this.changes();
  }

  public write(content: t.Tree, to?: string): void {
    writeTree(this.path(to), content);
  }

  public writeBinary(subpath: string, buffer: Buffer) {
    writeFile(this.path(subpath), buffer);
  }

  public writeText(subpath: string, text: string, encoding?: string) {
    writeFile(this.path(subpath), text, encoding || "utf8");
  }

  public makeDir(subpath: string): void {
    writeTree(this.path(subpath), {});
  }

  public copy(from: string, to?: string): void {
    writeTree(this.path(to), readTree(from));
  }

  public dispose(): Promise<void> {
    return removeDir(this.path());
  }
}
