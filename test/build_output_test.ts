import { expect } from "chai";
import { buildOutput, Output, Tree } from "../index";
const Fixturify: any = require("broccoli-fixturify");

describe("buildOutput", () => {
  let fixture: Tree;
  let subject: Output;

  beforeEach(() => {
    fixture = {
      "hello.txt": "hello world",
      "lib": {
        "more.txt": "even more"
      }
    };
    let outputNode = new Fixturify(fixture);
    return buildOutput(outputNode).then(output => {
      subject = output;
    });
  });

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
    ).to.deep.equal({
      "hello.txt": "create",
      "lib/": "mkdir",
      "lib/more.txt": "create"
    });

    return subject.rebuild().then(output => {
      expect( subject.changes() ).to.deep.equal({ });

      fixture["hello.txt"] = "goodbye";
      fixture["lib"] = null;

      return output.rebuild();
    }).then(output => {
      expect(
        output.changes()
      ).to.deep.equal({
        "lib/more.txt": "unlink",
        "lib/": "rmdir",
        "hello.txt": "change"
      });

      expect(
        output.read()
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
