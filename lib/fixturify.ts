import { Directory } from "./interfaces";
const fixturify: {
  readSync(path: string): Directory;
  writeSync(path: string, content: Directory): void;
} = require("fixturify");
export const readSync = fixturify.readSync;
export const writeSync = fixturify.writeSync;
