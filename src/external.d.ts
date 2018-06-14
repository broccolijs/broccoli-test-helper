declare module "walk-sync" {
  function walkSync(
    path: string,
    options?: import("./interfaces").ReadDirOptions
  ): string[];
  namespace walkSync {
    export function entries(path: string): Entry[];
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
  export = walkSync;
}

declare module "mktemp" {
  const mktemp: {
    createDir(
      template: string,
      callback: (err: Error, path: string) => void
    ): string;
  };
  export = mktemp;
}

declare module "fixturify" {
  export function readSync(path: string): import("./interfaces").Tree;
  export function writeSync(
    path: string,
    content: import("./interfaces").Tree
  ): void;
}

declare module "fs-tree-diff" {
  import { Entry } from "walk-sync";
  export function fromEntries(entries: Entry[]): FSTree;
  export interface FSTree {
    calculatePatch(
      next: FSTree
    ): Array<[import("./interfaces").ChangeOp, string, Entry]>;
  }
}
