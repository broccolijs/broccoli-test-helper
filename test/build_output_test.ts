import { createBuilder, Output, Tree } from "broccoli-test-helper";
import { expect } from "chai";

// tslint:disable-next-line:no-var-requires
const Fixturify: any = require("broccoli-fixturify");

describe("buildOutput", () => {
  let fixture: Tree;
  let subject: Output;

  beforeEach(async () => {
    fixture = {
      "hello.txt": "hello world",
      lib: {
        "more.txt": "even more",
      },
    };
    const outputNode = new Fixturify(fixture);
    subject = createBuilder(outputNode);
  });

  afterEach(() => subject.dispose());

  it("should support read", async () => {
    expect(subject.read()).to.deep.equal({});

    await subject.build();

    expect(subject.read()).to.deep.equal({
      "hello.txt": "hello world",
      lib: {
        "more.txt": "even more",
      },
    });

    expect(subject.read("lib")).to.deep.equal({
      "more.txt": "even more",
    });
  });

  it("should support changes on build and rebuild", async () => {
    expect(subject.changes()).to.deep.equal({});

    await subject.build();

    expect(subject.changes()).to.deep.equal({
      "hello.txt": "create",
      "lib/": "mkdir",
      "lib/more.txt": "create",
    });

    fixture["hello.txt"] = "goodbye";
    // tslint:disable-next-line no-string-literal
    fixture["lib"] = null;

    await subject.build();

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

  it("support cleanup builder on dispose", async () => {
    await subject.dispose();

    // output path is gone
    expect(() => subject.read()).to.throw(/ENOENT/);
  });
});
