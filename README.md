# broccoli-test-helper
[![Build status](https://ci.appveyor.com/api/projects/status/x0975l07h1gve9ys/branch/master?svg=true)](https://ci.appveyor.com/project/krisselden/broccoli-test-helper/branch/master)
[![Build Status](https://travis-ci.org/krisselden/broccoli-test-helper.svg?branch=master)](https://travis-ci.org/krisselden/broccoli-test-helper)

Test helpers for BroccoliPlugins that make testing build and rebuild behavior dead simple and expect diff friendly.

```js
import { expect } from "chai";
import { createBuilder, createTempDir } from "broccoli-test-helper";
import MyBroccoliPlugin from "../index";

describe("MyBroccoliPlugin", () => {
  let input;
  let output;
  let subject;

  beforeEach(async () => {
    input = await createTempDir();
    subject = new MyBroccoliPlugin(input.path());
    output = createBuilder(subject);
  });

  afterEach(async () => {
    await input.dispose();
    await output.dispose();
  });

  it("should build", async () => {
    input.write({
      "index.js": `export { A } from "./lib/a";`,
      "lib": {
        "a.js": `export class A {};`,
        "b.js": `export class B {};`,
        "c.js": `export class C {};`
      }
    });

    await output.build();

    expect(
      output.read()
    ).to.deep.equal({
      "index.js": `exports.A = require("./lib/a").A;`,
      "lib": {
        "a.js": `exports.A = class A {};`,
        "b.js": `exports.B = class B {};`,
        "c.js": `exports.C = class C {};`
      }
    });

    await output.build();

    expect(
      output.changes()
    ).to.deep.equal({
    });

    input.write({
      "index.js": "export class A {};",
      "lib": null // delete dir
    });

    await output.build();

    expect(
      output.changes()
    ).to.deep.equal({
      "lib/c.js": "unlink",
      "lib/b.js": "unlink",
      "lib/a.js": "unlink",
      "lib/":     "rmdir",
      "index.js": "change"
    });

    expect(
      output.read()
    ).to.deep.equal({
      "index.js": `exports.A = class A {};`
    });
  });
});
```
