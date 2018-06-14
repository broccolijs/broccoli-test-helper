import { createTempDir, TempDir } from "broccoli-test-helper";
import { expect } from "chai";
import * as fs from "fs";

describe("createTempDir", () => {
  let subject: TempDir;

  beforeEach(async () => {
    subject = await createTempDir();
  });

  afterEach(async () => {
    await subject.dispose();
    subject = undefined as any;
  });

  it("should support writing", () => {
    subject.write({
      "file.txt": "hello world",
      lib: {},
    });

    expect(fs.readdirSync(subject.path())).to.deep.equal(["file.txt", "lib"]);

    expect(fs.readFileSync(subject.path("file.txt"), "utf8")).to.equal(
      "hello world"
    );

    subject.write(
      {
        "more.txt": "another",
      },
      "lib"
    );

    expect(fs.readFileSync(subject.path("lib/more.txt"), "utf8")).to.equal(
      "another"
    );

    subject.write({
      // tslint:disable-next-line object-literal-key-quotes
      lib: null,
    });

    expect(fs.readdirSync(subject.path())).to.deep.equal(["file.txt"]);
  });

  it("should support writing binary", () => {
    const expected = "R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=";

    subject.writeBinary("images/test.gif", Buffer.from(expected, "base64"));

    expect(
      fs.readFileSync(subject.path("images/test.gif")).toString("base64")
    ).to.equal(expected);
  });

  it("should support reading binary", () => {
    const expected = "R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=";

    fs.writeFileSync(subject.path("test.gif"), Buffer.from(expected, "base64"));

    expect(subject.readBinary("test.gif")!.toString("base64")).to.equal(
      expected
    );
  });

  it("should support writing text with encoding", () => {
    subject.writeText("texts/ucs2.txt", "\ud801\udc37", "ucs2");
    subject.writeText("texts/utf8.txt", "\ud801\udc37", "utf8");

    expect(fs.readFileSync(subject.path("texts/ucs2.txt"), "hex")).to.equal(
      "01d837dc"
    );
    expect(fs.readFileSync(subject.path("texts/utf8.txt"), "hex")).to.equal(
      "f09090b7"
    );
  });

  it("should return undefined on a missing file when reading binary", () => {
    expect(subject.readText("missing.txt", "ucs2")).to.equal(undefined);
    expect(subject.readBinary("image.gif")).to.equal(undefined);
  });

  it("should support reading text with encoding", () => {
    fs.writeFileSync(subject.path("ucs2.txt"), "01d837dc", "hex");
    fs.writeFileSync(subject.path("utf8.txt"), "f09090b7", "hex");

    expect(subject.readText("ucs2.txt", "ucs2")).to.equal("\ud801\udc37");
    expect(subject.readText("utf8.txt", "utf8")).to.equal("\ud801\udc37");
  });

  it("should support making a directory", () => {
    subject.makeDir("images");

    expect(fs.statSync(subject.path("images")).isDirectory()).to.equal(true);
  });

  it("should support reading a directory", () => {
    expect(subject.readDir()).to.deep.equal([]);

    subject.write({
      dist: {
        "index.js": "",
        tests: {
          "test.js": "",
        },
      },
      "package.json": "",
      src: {
        "index.ts": "",
      },
      styles: { "app.css": "" },
      tests: {
        "test.ts": "",
      },
    });

    expect(subject.readDir()).to.deep.equal([
      "dist/",
      "dist/index.js",
      "dist/tests/",
      "dist/tests/test.js",
      "package.json",
      "src/",
      "src/index.ts",
      "styles/",
      "styles/app.css",
      "tests/",
      "tests/test.ts",
    ]);

    expect(subject.readDir("dist")).to.deep.equal([
      "index.js",
      "tests/",
      "tests/test.js",
    ]);

    expect(subject.readDir("dist", { directories: false })).to.deep.equal([
      "index.js",
      "tests/test.js",
    ]);

    expect(
      subject.readDir({
        directories: false,
      })
    ).to.deep.equal([
      "dist/index.js",
      "dist/tests/test.js",
      "package.json",
      "src/index.ts",
      "styles/app.css",
      "tests/test.ts",
    ]);

    expect(
      subject.readDir({
        directories: false,
        include: ["**/*.js"],
      })
    ).to.deep.equal(["dist/index.js", "dist/tests/test.js"]);

    expect(
      subject.readDir("dist", {
        directories: false,
        include: ["**/*.js"],
      })
    ).to.deep.equal(["index.js", "tests/test.js"]);

    expect(
      subject.readDir({
        directories: false,
        exclude: ["dist/tests/**"],
        include: ["dist/**"],
      })
    ).to.deep.equal(["dist/index.js"]);

    expect(subject.readDir("dist/index.js")).to.be.equal(undefined);
    expect(subject.readDir("missing")).to.be.equal(undefined);
  });

  it("should support changes", async () => {
    expect(subject.changes()).to.deep.equal({});

    subject.write({
      "hello.txt": "hello",
      lib: { "more.txt": "more" },
    });

    expect(subject.changes()).to.deep.equal({
      "hello.txt": "create",
      "lib/": "mkdir",
      "lib/more.txt": "create",
    });

    subject.write({
      "hello.txt": "goodbye",
      lib: null,
    });

    expect(subject.changes()).to.deep.equal({
      "lib/more.txt": "unlink",
      // tslint:disable-next-line object-literal-sort-keys
      "lib/": "rmdir",
      "hello.txt": "change",
    });

    expect(subject.read()).to.deep.equal({
      "hello.txt": "goodbye",
    });
  });

  it("should support reading", () => {
    fs.writeFileSync(subject.path("file.txt"), "hello world");
    fs.mkdirSync(subject.path("lib"));
    fs.writeFileSync(subject.path("lib/more.txt"), "another");

    expect(subject.read()).to.deep.equal({
      "file.txt": "hello world",
      lib: {
        "more.txt": "another",
      },
    });

    expect(subject.read("lib")).to.deep.equal({
      "more.txt": "another",
    });
  });

  it("should support copy from fixture path", () => {
    subject.copy("tests/fixtures/a");

    expect(fs.readdirSync(subject.path())).to.deep.equal(["index.js", "lib"]);

    expect(fs.readFileSync(subject.path("index.js"), "utf8")).to.equal(
      'export * from "./lib/a";\n'
    );

    expect(fs.readdirSync(subject.path("lib"))).to.deep.equal(["a.js"]);

    expect(fs.readFileSync(subject.path("lib/a.js"), "utf8")).to.equal(
      "export class A {}\n"
    );

    subject.copy("tests/fixtures/a", "lib");

    expect(fs.readdirSync(subject.path("lib"))).to.deep.equal([
      "a.js",
      "index.js",
      "lib",
    ]);

    expect(fs.readFileSync(subject.path("lib/index.js"), "utf8")).to.equal(
      'export * from "./lib/a";\n'
    );

    expect(fs.readdirSync(subject.path("lib/lib"))).to.deep.equal(["a.js"]);

    expect(fs.readFileSync(subject.path("lib/lib/a.js"), "utf8")).to.equal(
      "export class A {}\n"
    );
  });

  it("should remove tmp dir on dispose", async () => {
    await subject.dispose();
    expect(() => {
      subject.read();
    }).to.throw(/ENOENT/);
  });

  it("writing outside of tmp with subpath should fail", () => {
    expect(() => {
      subject.write({}, "..");
    }).throws(/subpath should not escape directory/);
  });
});
