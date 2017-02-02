import * as rsvp from "rsvp";
import * as t from "./interfaces";
import Output from "./output";
import TempDir from "./temp_dir";
import makeTempDir from "./make_temp_dir";

const Builder: {
  new (outputNode: any): t.Builder;
} = require("broccoli").Builder;

/**
 * Create temporary dir.
 */
export function createTempDir(): rsvp.Promise<t.TempDir> {
  return makeTempDir().then(tmpdir => new TempDir(tmpdir));
}

/**
 * Build output.
 */
export function buildOutput(outputNode: any): rsvp.Promise<t.Output> {
  const builder = new Builder(outputNode);
  return builder.build().then(() => new Output(builder));
}
