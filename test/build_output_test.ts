import { expect } from "chai";
import { buildOutput, Output, Tree } from "../index";
const Fixturify: any = require("broccoli-fixturify");

describe("buildOutput", () => {
  let subject: Output;
  const fixture: Tree = {
    "hello.txt": "hello world",
    "lib": {
      "more.txt": "even more"
    }
  };
  const outputNode = new Fixturify(fixture);

  beforeEach(() => buildOutput(outputNode).then(output => {
    subject = output;
  }));

  afterEach(() => subject.dispose());

  it("should support read", () => {
    expect(
      subject.read()
    ).to.deep.equal({
      "hello.txt": "hello world",
      "lib": {
        "more.txt": "even more"
      }
    });

    expect(
      subject.read("lib")
    ).to.deep.equal({
      "more.txt": "even more"
    });
  });

  it("should support changes on build and rebuild", () => {
    expect(
      subject.changes()
    ).to.deep.equal([{
      "type": "create",
      "path": "hello.txt"
    }, {
      "type": "mkdir",
      "path": "lib/"
    }, {
      "type": "create",
      "path": "lib/more.txt"
    }]);

    fixture["hello.txt"] = "goodbye";
    fixture["lib"] = null;

    return subject.rebuild().then(() => {
      expect(
        subject.changes()
      ).to.deep.equal([{
        "type": "unlink",
        "path": "lib/more.txt"
      }, {
        "type": "rmdir",
        "path": "lib/"
      }, {
        "type": "change",
        "path": "hello.txt"
      }]);

      expect(
        subject.read()
      ).to.deep.equal({
        "hello.txt": "goodbye"
      });
    });
  });

  it("support cleanup builder on dispose", () => {
    return subject.dispose().then(() => {
      expect(() => subject.read()).to.throw(/ENOENT/);
    });
  });
});
