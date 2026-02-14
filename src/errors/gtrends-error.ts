export class GTrendsError extends Error {
  public readonly code: string;

  constructor(message: string, code = "GTRENDS_ERROR") {
    super(message);
    this.name = new.target.name;
    this.code = code;
  }
}
