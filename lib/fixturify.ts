import { Tree } from "./interfaces";
const fixturify: {
  readSync(path: string): Tree;
  writeSync(path: string, content: Tree): void;
} = require("fixturify");
export const readSync = fixturify.readSync;
export const writeSync = fixturify.writeSync;
