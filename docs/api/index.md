# broccoli-test-helper API

- [broccoli-test-helper](../../README.md#broccoli-test-helper)
  - [Functions](#functions)
    - [fromDir(dir)](#fromdirdir)
    - [createTempDir()](#createtempdir)
    - [fromBuilder(builder)](#frombuilderbuilder)
    - [createBuilder(outputNode)](#createbuilderoutputnode)
  - [Interfaces](#interfaces)
    - [Output](#output)
      - [Output.changes()](#outputchanges)
      - [Output.build()](#outputbuild)
    - [TempDir](#tempdir)
      - [TempDir.changes()](#tempdirchanges)
      - [TempDir.write(content, to)](#tempdirwritecontent-to)
      - [TempDir.copy(from, to)](#tempdircopyfrom-to)
      - [TempDir.writeBinary(subpath)](#tempdirwritebinarysubpath)
      - [TempDir.writeText(subpath, encoding)](#tempdirwritetextsubpath-encoding)
      - [TempDir.makeDir(subpath)](#tempdirmakedirsubpath)
    - [ReadableDir](#readabledir)
      - [ReadableDir.read(from)](#readabledirreadfrom)
      - [ReadableDir.path(subpath)](#readabledirpathsubpath)
      - [ReadableDir.readBinary(subpath)](#readabledirreadbinarysubpath)
      - [ReadableDir.readText(subpath, encoding)](#readabledirreadtextsubpath-encoding)
      - [ReadableDir.readDir(options)](#readabledirreaddiroptions)
      - [ReadableDir.readDir(subpath, options)](#readabledirreaddirsubpath-options)
      - [ReadableDir.changes()](#readabledirchanges)
    - [Disposable](#disposable)
      - [Disposable.dispose()](#disposabledispose)
    - [Changes](#changes)
      - [Changes[path]](#changespath)
    - [Tree](#tree)
      - [Tree[name]](#treename)
    - [ReadDirOptions](#readdiroptions)
    - [Builder](#builder)
      - [Builder.build()](#builderbuild)
      - [Builder.cleanup()](#buildercleanup)
  - [Types](#types)
    - [TreeEntry](#treeentry)
    - [ChangeOp](#changeop)

## Functions

### fromDir(dir)

Returns a [ReadableDir](#readabledir) from the specified directory.

```typescript
function fromDir(dir: string): ReadableDir;
```

**Example**

A directory of fixtures.

```typescript
const fixtures = fromDir("tests/fixtures");
const tmpDir = await createTempDir();
tmpDir.write(fixtures.read("test-case-a"));
```

This pattern makes it so you don't accidentally mutate source fixtures.

You could also use [TempDir.copy(from, to)](#tempdircopyfrom-to) but this
allows more flexibility like iteration of test cases:

```typescript
fixtures.readDir({ include: ["test-case-*"] }).forEach(testCaseDir =>
  generateTestCase(extractNameFrom(testCaseDir), {
    setup(input) {
      input.write(fixtures.read(testCaseDir));
    },
  })
);
```

**Example**

Track changes outside of build outputPath

```typescript
const dist = fromDir("dist");
// start tracking changes
dist.changes();
// do something
await output.build();
// assert changes
assert.deepEqual(dist.changes, expectedChanges);
```

**Parameters**

| Name | Type   | Description                   |
| ---- | ------ | ----------------------------- |
| dir  | string | path to the fixture directory |

**Return type**

[ReadableDir](#readabledir)

---

### createTempDir()

Create temporary directory for mutation.

```typescript
function createTempDir(): Promise<TempDir>;
```

**Return type**

Promise<[TempDir](#tempdir)>

---

### fromBuilder(builder)

Returns an [Output](#output) from a [Builder](#builder).

```typescript
function fromBuilder(builder: Builder): Output;
```

The [Output](#output) is a [ReadableDir](#readabledir) that supports building
with change tracking between builds.

**Parameters**

| Name    | Type                |
| ------- | ------------------- |
| builder | [Builder](#builder) |

**Return type**

[Output](#output)

---

### createBuilder(outputNode)

Create a broccoli [Builder](#builder) with the specified outputNode
returning an [Output](#output) interface for testing.

```typescript
function createBuilder(outputNode: any): Output;
```

**Parameters**

| Name       | Type |
| ---------- | ---- |
| outputNode | any  |

**Return type**

[Output][interfacedeclaration-6]

## Interfaces

### Output

Test helper for building output and making assertions.

```typescript
interface Output extends ReadableDir, Disposable {
  builder: Builder;
  changes(): Changes;
  build(): Promise<void>;
}
```

**Extends**

[ReadableDir](#readabledir)

[Disposable](#disposable)

#### Output.changes()

Get changes from last build.

Use to assert deep equal against expected changes.

```typescript
changes(): Changes;
```

**Return type**

[Changes](#changes)

#### Output.build()

Build output.

```typescript
build(): Promise<void>;
```

**Return type**

Promise<void>

**Properties**

| Name    | Type                | Optional | Description                                          |
| ------- | ------------------- | -------- | ---------------------------------------------------- |
| builder | [Builder](#builder) | false    | The builder associated with this output test helper. |

---

### TempDir

A disposable temporary directory for writing mutable fixture data to.

```typescript
interface TempDir extends ReadableDir, Disposable {
  changes(): Changes;
  write(content: Tree, to?: string | undefined): void;
  copy(from: string, to?: string | undefined): void;
  writeBinary(subpath: string, data: Buffer): void;
  writeText(subpath: string, text: string, encoding?: string): void;
  makeDir(subpath: string): void;
}
```

**Extends**

[ReadableDir](#readabledir)

[Disposable](#disposable)

#### TempDir.changes()

Gets the changes since the last time changes() was called or
since the temporary directory was created.

Useful for tracking changes to a tmp dir that is not part of
the build [Output](#output).

```typescript
changes(): Changes;
```

**Return type**

[Changes](#changes)

#### TempDir.write(content, to)

Write to the temporary directory.

```typescript
write(content: Tree, to?: string | undefined): void;
```

**Parameters**

| Name    | Type                    | Description                                            |
| ------- | ----------------------- | ------------------------------------------------------ |
| content | [Tree](#tree)           | the content to write to the temporary directory.       |
| to      | string &#124; undefined | a sub path to write to within the temporary directory. |

**Return type**

void

#### TempDir.copy(from, to)

Copy contents of a fixture directory to the temporary directory.

```typescript
copy(from: string, to?: string | undefined): void;
```

**Parameters**

| Name | Type                    | Description                                           |
| ---- | ----------------------- | ----------------------------------------------------- |
| from | string                  | a directory to copy from.                             |
| to   | string &#124; undefined | a subpath to write to within the temporary directory. |

**Return type**

void

#### TempDir.writeBinary(subpath)

Write the binary file at the specified subpath.

```typescript
writeBinary(subpath: string, data: Buffer): void;
```

**Parameters**

| Name    | Type   |
| ------- | ------ |
| subpath | string |
| data    | Buffer |

**Return type**

void

#### TempDir.writeText(subpath, encoding)

Write the text file at the specified subpath.

```typescript
writeText(subpath: string, text: string, encoding?: string): void;
```

**Parameters**

| Name     | Type                    |
| -------- | ----------------------- |
| subpath  | string                  |
| text     | string                  |
| encoding | string &#124; undefined |

**Return type**

void

#### TempDir.makeDir(subpath)

Make a directory at the specified subpath.

```typescript
makeDir(subpath: string): void;
```

**Parameters**

| Name    | Type   |
| ------- | ------ |
| subpath | string |

**Return type**

void

---

### ReadableDir

Common methods for directory test helpers.

```typescript
interface ReadableDir {
  read(from?: string | undefined): Tree;
  path(subpath?: string | undefined): string;
  readBinary(subpath: string): Buffer | undefined;
  readText(subpath: string, encoding?: string | undefined): string | undefined;
  readDir(options?: ReadDirOptions | undefined): string[];
  readDir(
    subpath?: string | undefined,
    options?: ReadDirOptions | undefined
  ): string[] | undefined;
  changes(): Changes;
}
```

#### ReadableDir.read(from)

Read the content of the directory.

```typescript
read(from?: string | undefined): Tree;
```

**Parameters**

| Name | Type                    | Description                                        |
| ---- | ----------------------- | -------------------------------------------------- |
| from | string &#124; undefined | a relative path to read from within the directory. |

**Return type**

[Tree][interfacedeclaration-1]

#### ReadableDir.path(subpath)

Resolves and normalizes the path to the directory or the subpath if specified.

```typescript
path(subpath?: string | undefined): string;
```

**Parameters**

| Name    | Type                    | Description                   |
| ------- | ----------------------- | ----------------------------- |
| subpath | string &#124; undefined | subpath within the directory. |

**Return type**

string

#### ReadableDir.readBinary(subpath)

Reads the binary file at the specified subpath.

```typescript
readBinary(subpath: string): Buffer | undefined;
```

**Parameters**

| Name    | Type   |
| ------- | ------ |
| subpath | string |

**Return type**

Buffer | undefined

#### ReadableDir.readText(subpath, encoding)

Reads the text file at the specified subpath.

```typescript
readText(subpath: string, encoding?: string | undefined): string | undefined;
```

**Parameters**

| Name     | Type                    |
| -------- | ----------------------- |
| subpath  | string                  |
| encoding | string &#124; undefined |

**Return type**

string | undefined

#### ReadableDir.readDir(options)

Reads the directory entries recursively using the specified options.

```typescript
readDir(options?: ReadDirOptions | undefined): string[] | undefined;
```

**Parameters**

| Name    | Type                            |
| ------- | ------------------------------- |
| options | ReadDirOptions &#124; undefined |

**Return type**

string[] | undefined

#### ReadableDir.readDir(subpath, options)

Reads the directory entries recursively at the specified subpath using the specified options.

```typescript
readDir(subpath: string, options?: ReadDirOptions | undefined): string[] | undefined;
```

**Parameters**

| Name    | Type                                               |
| ------- | -------------------------------------------------- |
| subpath | string                                             |
| options | [ReadDirOptions](#readdiroptions) &#124; undefined |

**Return type**

string[] | undefined

#### ReadableDir.changes()

Gets the changes since the last time changes() was called or
starts tracking changes and returns empty.

Useful for tracking changes to a directory that is not part of the build [Output](#output)

```typescript
changes(): Changes;
```

**Return type**

[Changes](#changes)

---

### Disposable

This interface is implemented by all test helpers that have cleanup.

Errors during cleanup are logged, dispose does not reject.

```typescript
interface Disposable {
  dispose(): Promise<void>;
}
```

#### Disposable.dispose()

Cleanup disposable without rejection.

```typescript
dispose(): Promise<void>;
```

**Return type**

Promise<void>

---

### Changes

Map of path to change operation.

```typescript
interface Changes {
  [path: string]: ChangeType;
}
```

#### Changes[path]

```typescript
[path: string]: ChangeOp;
```

- _Parameter_ `path` - string
- _Type_ [ChangeOp](#changeop)

---

### Tree

Represents a directory's contents.

```typescript
interface Tree {
  [name: string]: TreeEntry | undefined;
}
```

#### Tree[name]

```typescript
[name: string]: TreeEntry | undefined;
```

- _Parameter_ `name` - string
- _Type_ [TreeEntry](#treeentry) | undefined

---

### ReadDirOptions

Options for Tree.readDir

```typescript
interface ReadDirOptions {
  include?: string[];
  exclude?: string[];
  directories?: boolean | undefined;
}
```

**Properties**

| Name        | Type                     | Optional | Description                                               |
| ----------- | ------------------------ | -------- | --------------------------------------------------------- |
| include     | string[]                 | true     | Array of globs to include                                 |
| exclude     | string[]                 | true     | Array of globs to exclude                                 |
| directories | boolean &#124; undefined | true     | Whether directories should be included in readDir result. |

---

### Builder

Interface expected by [fromBuilder(builder)](#frombuilderbuilder).

```typescript
interface Builder {
  outputPath: string;
  build(): Promise<void>;
  cleanup(): Promise<void> | void;
}
```

#### Builder.build()

Builds output.

```typescript
build(): Promise<void>;
```

**Return type**

Promise<void>

#### Builder.cleanup()

Cleanup temporary build artifacts.

Current version is void return but reserves the possibility of
returning a promise in the future so the [Output](#output) test
helper assumes it could be a promise.

```typescript
cleanup(): Promise<void> | void;
```

**Return type**

Promise<void> | void

**Properties**

| Name       | Type   | Optional | Description                    |
| ---------- | ------ | -------- | ------------------------------ |
| outputPath | string | false    | Path to output of the builder. |

---

## Types

### TreeEntry

Tree entry value type.

- `string` if entry is a file.
- [Tree](#tree) if entry is a directory.
- `null` if entry is a deletion in [TempDir.write(content, to)](#tempdirwritecontent-to)

```typescript
type TreeEntry = Tree | string | null;
```

### ChangeOp

Type of path change

```typescript
type ChangeOp = "unlink" | "create" | "mkdir" | "rmdir" | "change";
```
