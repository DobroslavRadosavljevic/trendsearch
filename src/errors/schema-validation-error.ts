import { GTrendsError } from "./gtrends-error";

export class SchemaValidationError extends GTrendsError {
  public readonly endpoint: string;
  public readonly issues: string[];

  constructor(args: { endpoint: string; issues: string[] }) {
    super(
      `Schema validation failed for endpoint '${args.endpoint}'.`,
      "SCHEMA_VALIDATION_ERROR"
    );
    this.endpoint = args.endpoint;
    this.issues = args.issues;
  }
}
