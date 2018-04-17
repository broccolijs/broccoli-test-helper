import { expect } from "chai";
import * as fs from "fs";
import { createTempDir, TempDir } from "../index";

describe("createTempDir", () => {
  let subject: TempDir;

  beforeEach(async () => {
    subject = await createTempDir();
  });

  afterEach(async () => {
    await subject.dispose();
  });

  it("should support writing", () => {
    subject.write({
      "file.txt": "hello world",
      "lib": {}
    });

    expect(
      fs.readdirSync(subject.path())
    ).to.deep.equal(
      ["file.txt", "lib"]
    );

    expect(
      fs.readFileSync( subject.path("file.txt"), "utf8" )
    ).to.equal(
      "hello world"
    );

    subject.write({
      "more.txt": "another"
    }, "lib");

    expect(
      fs.readFileSync( subject.path("lib/more.txt"), "utf8" )
    ).to.equal(
      "another"
    );

    subject.write({
      // tslint:disable-next-line object-literal-key-quotes
      "lib": null
    });

    expect(
      fs.readdirSync(subject.path())
    ).to.deep.equal(
      ["file.txt"]
    );
  });

  it("should support changes", async () => {
    expect(
      subject.changes()
    ).to.deep.equal({});

    subject.write({
      "hello.txt": "hello",
      "lib": { "more.txt": "more" }
    });

    expect(
      subject.changes()
    ).to.deep.equal({
      "hello.txt": "create",
      "lib/": "mkdir",
      "lib/more.txt": "create"
    });

    subject.write({
      "hello.txt": "goodbye",
      "lib": null
    });

    expect(
      subject.changes()
    ).to.deep.equal({
      "lib/more.txt": "unlink",
      // tslint:disable-next-line object-literal-sort-keys
      "lib/": "rmdir",
      "hello.txt": "change"
    });

    expect(
      subject.read()
    ).to.deep.equal({
      "hello.txt": "goodbye"
    });
  });

  it("should support reading", () => {
    fs.writeFileSync(subject.path("file.txt"), "hello world");
    fs.mkdirSync(subject.path("lib"));
    fs.writeFileSync(subject.path("lib/more.txt"), "another");

    expect(
      subject.read()
    ).to.deep.equal({
      "file.txt": "hello world",
      "lib": {
        "more.txt": "another"
      }
    });

    expect(
      subject.read("lib")
    ).to.deep.equal({
      "more.txt": "another"
    });
  });

  it("should support copy from fixture path", () => {
    subject.copy("test/fixtures/a");

    expect(
      fs.readdirSync(subject.path())
    ).to.deep.equal(
      ["index.js", "lib"]
    );

    expect(
      fs.readFileSync(subject.path("index.js"), "utf8")
    ).to.equal(
      "export * from \"./lib/a\";\n"
    );

    expect(
      fs.readdirSync(subject.path("lib"))
    ).to.deep.equal(
      ["a.js"]
    );

    expect(
      fs.readFileSync(subject.path("lib/a.js"), "utf8")
    ).to.equal(
      "export class A {}\n"
    );

    subject.copy("test/fixtures/a", "lib");

    expect(
      fs.readdirSync(subject.path("lib"))
    ).to.deep.equal(
      ["a.js", "index.js", "lib"]
    );

    expect(
      fs.readFileSync(subject.path("lib/index.js"), "utf8")
    ).to.equal(
      "export * from \"./lib/a\";\n"
    );

    expect(
      fs.readdirSync(subject.path("lib/lib"))
    ).to.deep.equal(
      ["a.js"]
    );

    expect(
      fs.readFileSync(subject.path("lib/lib/a.js"), "utf8")
    ).to.equal(
      "export class A {}\n"
    );
  });

  it("should remove tmp dir on dispose", async () => {
    await subject.dispose();
    expect(() => {
      subject.read();
    }).to.throw(/ENOENT/);
  });
});
