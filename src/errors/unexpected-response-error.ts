import { GTrendsError } from "./gtrends-error";

export class UnexpectedResponseError extends GTrendsError {
  public readonly endpoint: string;

  constructor(args: { endpoint: string; message: string }) {
    super(args.message, "UNEXPECTED_RESPONSE_ERROR");
    this.endpoint = args.endpoint;
  }
}
