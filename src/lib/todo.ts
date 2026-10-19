/** Thrown by scaffold stubs that a parallel agent has not filled in yet. */
export class NotImplementedError extends Error {
  constructor(what: string) {
    super(`Not implemented yet: ${what}`);
    this.name = "NotImplementedError";
  }
}
