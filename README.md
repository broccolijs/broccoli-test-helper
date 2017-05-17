# broccoli-test-helper
[![Build status](https://ci.appveyor.com/api/projects/status/x0975l07h1gve9ys/branch/master?svg=true)](https://ci.appveyor.com/project/krisselden/broccoli-test-helper/branch/master)
[![Build Status](https://travis-ci.org/krisselden/broccoli-test-helper.svg?branch=master)](https://travis-ci.org/krisselden/broccoli-test-helper)

Test helpers for BroccoliPlugins that make testing build and rebuild behavior dead simple and expect diff friendly.

```js
'use strict';

const expect = require('chai').expect;
const helpers = require('broccoli-test-helper');
const createBuilder = helpers.createBuilder;
const createTempDir = helpers.createTempDir;
const MyBroccoliPlugin = require("../index");
const co = require('co');

describe("MyBroccoliPlugin", function() {
  let input;
  let output;
  let subject;

  beforeEach(co.wrap(function* () {
    input = yield createTempDir();
    subject = new MyBroccoliPlugin(input.path());
    output = createBuilder(subject);
  }));

  afterEach(co.wrap(function* () {
    yield input.dispose();
    yield output.dispose();
  }));

  it("should build", co.wrap(function* () {
    input.write({
      "index.js": `export { A } from "./lib/a";`,
      "lib": {
        "a.js": `export class A {};`,
        "b.js": `export class B {};`,
        "c.js": `export class C {};`
      }
    });

    yield output.build();

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

    yield output.build();

    expect(
      output.changes()
    ).to.deep.equal({ });

    input.write({
      "index.js": "export class A {};",
      "lib": null // delete dir
    });

    yield output.build();

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
  }));
});
```
