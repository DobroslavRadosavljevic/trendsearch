import { GTrendsError } from "./gtrends-error";

export class RateLimitError extends GTrendsError {
  public readonly url: string;
  public readonly status: number;

  constructor(args: { message: string; url: string; status?: number }) {
    super(args.message, "RATE_LIMIT_ERROR");
    this.url = args.url;
    this.status = args.status ?? 429;
  }
}
