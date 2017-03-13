import * as os from "os";
import { join } from "path";
import * as rsvp from "rsvp";

const mktemp: {
  createDir(template: string, callback: (err: Error, path: string) => void): string;
} = require("mktemp");

export default function makeTempDir(): rsvp.Promise<string> {
  return new rsvp.Promise((resolve, reject) => {
    let template = join(os.tmpdir(), "XXXXXX");
    mktemp.createDir(template, (err, path) => err ? reject(err) : resolve(path));
  });
}
