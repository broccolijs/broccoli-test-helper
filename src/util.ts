import { readSync, writeSync } from "fixturify";
import { readFileSync } from "fs";
import { fromEntries, FSTree } from "fs-tree-diff";
import * as mktemp from "mktemp";
import { tmpdir } from "os";
import * as pathmod from "path";
import * as rimraf from "rimraf";
import * as walkSync from "walk-sync";
import { Changes, ReadDirOptions, Tree } from "./interfaces";

function normalizeSlashes(path: string): string {
  return path.replace(/\\/g, "/");
}

export function resolvePath(path: string): string {
  return normalizeSlashes(pathmod.resolve(path));
}

export function joinPath(path: string, subpath: string): string {
  return normalizeSlashes(pathmod.join(path, subpath));
}

export function readTree(path: string): Tree {
  return readSync(path);
}

export function writeTree(path: string, tree: Tree): void {
  writeSync(path, tree);
}

export function readFile(path: string, encoding: string): string | undefined;
export function readFile(path: string): Buffer | undefined;
export function readFile(
  path: string,
  encoding?: string
): string | Buffer | undefined {
  try {
    return encoding === undefined
      ? readFileSync(path)
      : readFileSync(path, encoding);
  } catch (e) {
    if (e.code === "EISDIR" || e.code === "ENOENT") {
      return;
    }
    throw e;
  }
}

export function readDir(path: string, options?: ReadDirOptions) {
  try {
    return walkSync(path, options);
  } catch (e) {
    if (e.code === "ENOTDIR" || e.code === "ENOENT") {
      return;
    }
    throw e;
  }
}

export function removeDir(path: string): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    rimraf(path, err => {
      err ? reject(err) : resolve();
    });
  });
}

export function makeTempDir(): Promise<string> {
  return new Promise((resolve, reject) => {
    const template = pathmod.join(tmpdir(), "XXXXXX");
    mktemp.createDir(
      template,
      (err, path) => (err ? reject(err) : resolve(path))
    );
  });
}

export function readEntries(path: string): FSTree {
  return fromEntries(walkSync.entries(path));
}

export function diffEntries(current: FSTree, previous?: FSTree): Changes {
  if (previous === undefined) {
    previous = fromEntries([]);
  }
  const patch = previous.calculatePatch(current);
  const changes: Changes = (this.changes = {});
  for (let i = 0; i < patch.length; i++) {
    const op = patch[i][0];
    const path = patch[i][1];
    changes[path] = op;
  }
  return changes;
}
