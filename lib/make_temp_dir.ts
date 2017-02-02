import * as rsvp from "rsvp";
import { join } from "path";
import * as os from "os";

const mktemp: {
  createDir(template: string, callback: (err: Error, path: string) => void): string;
} = require("mktemp");

export default function makeTempDir(): rsvp.Promise<string> {
  return new rsvp.Promise((resolve, reject) => {
    let template = join(os.tmpdir(), "XXXXXX");
    mktemp.createDir(template, (err, path) => err ? reject(err) : resolve(path));
  });
}
