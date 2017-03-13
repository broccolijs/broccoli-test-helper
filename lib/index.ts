import * as rsvp from "rsvp";
import * as t from "./interfaces";
export { Builder } from "./interfaces";
import makeTempDir from "./make_temp_dir";
import Output from "./output";
import ReadableDir from "./readable_dir";
import TempDir from "./temp_dir";

/**
 * Create readable dir.
 * @param dir
 */
export function createReadableDir(dir: string): t.ReadableDir {
  return new ReadableDir(dir);
}

/**
 * Create temporary dir.
 */
export function createTempDir(): rsvp.Promise<t.TempDir> {
  return makeTempDir().then((dir) => {
    return new TempDir(dir);
  });
}

/**
 * Create a build output helper with the specified builder.
 * @param builder a broccoli builder.
 */
export function wrapBuilder(builder: t.Builder): t.Output {
  return new Output(builder);
}

/**
 * Create a build output helper with the specified output node using
 * the broccoli `Builder`.
 * @param outputNode
 */
export function createBuilder(outputNode: any): t.Output {
  const Builder = require("broccoli").Builder;
  return wrapBuilder(new Builder(outputNode));
}

/**
 * Create a build output helper with the specified output node and a
 * promise for the initial build.
 * @param outputNode
 */
export function buildOutput(outputNode: any): rsvp.Promise<t.Output> {
  let output = createBuilder(outputNode);
  return output.build().then(() => output);
}
