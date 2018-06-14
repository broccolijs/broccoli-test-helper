import * as t from "./interfaces";
import Output from "./output";
import ReadableDir from "./readable_dir";
import TempDir from "./temp_dir";
import { makeTempDir } from "./util";

/**
 * Wrap a fixture directory in a `ReadableDir` interface.
 * @param dir
 */
export function wrapDir(dir: string): t.ReadableDir {
  return new ReadableDir(dir);
}

/**
 * Create temporary directory for mutation.
 */
export function createTempDir(): Promise<t.TempDir> {
  return makeTempDir().then(dir => {
    return new TempDir(dir);
  });
}

/**
 * Wrap the specified Builder in the `Output` interface.
 * @param builder a broccoli builder.
 */
export function wrapBuilder(builder: t.Builder): t.Output {
  return new Output(builder);
}

/**
 * Create a broccoli `Builder` with the specified outputNode
 * and wrap it in the `Output` interface.
 * @param outputNode
 */
export function createBuilder(outputNode: any): t.Output {
  const Builder = require("broccoli").Builder;
  return wrapBuilder(new Builder(outputNode));
}

/**
 * @deprecated use `createBuilder(outputNode)` or `wrapBuilder(builder)` and `await output.build()`
 * @param outputNode
 */
export function buildOutput(outputNode: any): Promise<t.Output> {
  const output = createBuilder(outputNode);
  return output.build().then(() => output);
}

/**
 * @deprecated use `wrapDir(dir)`
 */
export function createReadableDir(dir: string): t.ReadableDir {
  return wrapDir(dir);
}
