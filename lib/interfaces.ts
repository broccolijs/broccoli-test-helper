import * as rsvp from "rsvp";

export interface Builder {
  outputPath: string;

  build(): rsvp.Promise<void>;
  cleanup(): rsvp.Promise<void> | void;
}

export interface Output {
  /**
   * Return the builder.
   */
  builder: Builder;

  /**
   * Read output directory (does not support non text files).
   *
   * @param from - a sub path to read from within the TempDir.
   */
  read(from?: string): Directory;

  /**
   * Return output path.
   *
   * @param subpath - subpath to join with output.
   */
  path(subpath?: string): string;

  /**
   * Get changes from last build.
   */
  changes(): Array<Change>;

  /**
   * Rebuild output.
   */
  rebuild(): rsvp.Promise<void>;

  /**
   * Cleanup builder;
   */
  dispose(): rsvp.Promise<void>;
}

/**
 * Represents a change in output.
 */
export interface Change {
  /**
   * Change type.
   */
  type: "create" | "mkdir" | "unlink" | "rmdir" | "change";

  /**
   * Relative path.
   */
  path: string;
}

/**
 * Represents a tmp directory to write fixture data to for input.
 */
export interface TempDir {
  /**
   * Write to the tmp dir.
   *
   * @param content - the content to write to the tmp dir.
   * @param to - a sub path to write to within the tmp dir.
   */
  write(content: Directory, to?: string): void;

  /**
   * Copy directory contents to input.
   *
   * @param from - a directory to copy from.
   * @param to - a sub path to write to within the tmp dir.
   */
  copy(from: string, to?: string): void;

  /**
   * Read the tmp dir.
   *
   * @param from - a sub path to read from within the tmp dir.
   */
  read(from?: string): Directory;

  /**
   * Returns the tmp dir path.
   *
   * @param subpath - subpath to join with the tmp dir.
   */
  path(subpath: string): string;

  /**
   * Deletes the tmp dir.
   */
  dispose(): rsvp.Promise<void>;
}

/**
 * Represents a directory's contents.
 */
export interface Directory {
  /**
   * Map directory entry to a Directory or file contents or null (delete when writing directory).
   */
  [fileName: string]: Directory | string | null | undefined;
}
