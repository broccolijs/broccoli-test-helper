import * as t from "./interfaces";
import Output from "./output";
import ReadableDir from "./readable_dir";
import TempDir from "./temp_dir";
import { makeTempDir } from "./util";

export * from "./interfaces";

/**
 * Wrap a fixture directory in a `ReadableDir` interface.
 * @param dir
 *
 * @public
 */
export function wrapDir(dir: string): t.ReadableDir {
  return new ReadableDir(dir);
}

/**
 * Create temporary directory for mutation.
 *
 * @public
 */
export function createTempDir(): Promise<t.TempDir> {
  return makeTempDir().then(dir => {
    return new TempDir(dir);
  });
}

/**
 * Wrap the specified Builder in the `Output` interface.
 * @param builder a broccoli builder.
 *
 * @public
 */
export function wrapBuilder(builder: t.Builder): t.Output {
  return new Output(builder);
}

/**
 * Create a broccoli `Builder` with the specified outputNode
 * and wrap it in the `Output` interface.
 * @param outputNode
 *
 * @public
 */
export function createBuilder(outputNode: any): t.Output {
  const Builder = require("broccoli").Builder;
  return wrapBuilder(new Builder(outputNode));
}

/**
 * @deprecated use `createBuilder(outputNode)` or `wrapBuilder(builder)` and `await output.build()`
 * @param outputNode
 * @private
 */
export function buildOutput(outputNode: any): Promise<t.Output> {
  // tslint:disable-next-line:no-console
  console.warn(
    "`buildOutput` is deprecated, use `createBuilder` or `wrapBuilder` followed by `builder.build()` instead"
  );
  const output = createBuilder(outputNode);
  return output.build().then(() => output);
}

/**
 * @deprecated use `wrapDir(dir)`
 * @private
 */
export function createReadableDir(dir: string): t.ReadableDir {
  // tslint:disable-next-line:no-console
  console.warn("`createReadableDir` is deprecated, use `wrapDir` instead");
  return wrapDir(dir);
}
