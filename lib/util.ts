import { readFileSync } from "fs";
import { tmpdir } from "os";
import { join, resolve } from "path";
import { ChangeOp, Changes, ReadDirOptions, Tree } from "./interfaces";
import rimraf = require("rimraf");

const walkSync: WalkSync = require("walk-sync");
const mktemp: Mktemp = require("mktemp");
const fixturify: Fixturify = require("fixturify");
const fsTreeDiff: FSTreeDiff = require("fs-tree-diff");

function normalizeSlashes(path: string): string {
  return path.replace(/\\/g, "/");
}

export function resolvePath(path: string): string {
  return normalizeSlashes(resolve(path));
}

export function joinPath(path: string, subpath: string): string {
  return normalizeSlashes(join(path, subpath));
}

export function readTree(path: string): Tree {
  return fixturify.readSync(path);
}

export function writeTree(path: string, tree: Tree): void {
  fixturify.writeSync(path, tree);
}

export function readFile(path: string, encoding: string): string | undefined;
export function readFile(path: string): Buffer | undefined;
export function readFile(path: string, encoding?: string): string | Buffer | undefined {
  try {
    return encoding === undefined ? readFileSync(path) : readFileSync(path, encoding);
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
    rimraf(path, (err) => {
      err ? reject(err) : resolve();
    });
  });
}

export function makeTempDir(): Promise<string> {
  return new Promise((resolve, reject) => {
    let template = join(tmpdir(), "XXXXXX");
    mktemp.createDir(template, (err, path) => err ? reject(err) : resolve(path));
  });
}

export function readEntries(path: string): FSTree {
  return fsTreeDiff.fromEntries(walkSync.entries(path));
}

export function diffEntries(current: FSTree, previous?: FSTree): Changes {
  if (previous === undefined) {
    previous = fsTreeDiff.fromEntries([]);
  }
  let patch = previous.calculatePatch(current);
  let changes: Changes = this.changes = {};
  for (let i = 0; i < patch.length; i++) {
    let op = patch[i][0];
    let path = patch[i][1];
    changes[path] = op;
  }
  return changes;
}

export interface Entry {
  relativePath: string;
  basePath: string;
  fullPath: string;
  mode: number;
  size: number;
  mtime: Date;
  isDirectory(): boolean;
}

export interface FSTree {
  calculatePatch(next: FSTree): Array<[ChangeOp, string, Entry]>;
}

interface Mktemp {
  createDir(template: string, callback: (err: Error, path: string) => void): string;
}

interface Fixturify {
  readSync(path: string): Tree;
  writeSync(path: string, content: Tree): void;
}

interface WalkSync {
  (path: string, options?: ReadDirOptions): string[];
  entries(path: string): Entry[];
}

interface FSTreeDiff {
  fromEntries(entries: Entry[]): FSTree;
}
