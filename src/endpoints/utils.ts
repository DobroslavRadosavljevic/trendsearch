import { UnexpectedResponseError } from "../errors";

export const formatDateWithoutDashes = (date: Date): string => {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  return `${year}${month}${day}`;
};

export const toLanguageCode = (hl: string): string =>
  hl.split("-")[0]?.toLowerCase() || "en";

export const buildComparisonItems = (args: {
  endpoint: string;
  keywords: string[];
  geo?: string | string[];
  time: string;
}): { keyword: string; geo?: string; time: string }[] => {
  const { keywords, geo, time } = args;

  if (!geo) {
    return keywords.map((keyword) => ({ keyword, time }));
  }

  if (typeof geo === "string") {
    return keywords.map((keyword) => ({ keyword, geo, time }));
  }

  if (geo.length === 1) {
    return keywords.map((keyword) => ({ keyword, geo: geo[0], time }));
  }

  if (geo.length !== keywords.length) {
    throw new UnexpectedResponseError({
      endpoint: args.endpoint,
      message:
        "When geo is an array, it must have length 1 or match the number of keywords.",
    });
  }

  return keywords.map((keyword, index) => ({
    keyword,
    geo: geo[index],
    time,
  }));
};

export const findDeepArrays = (value: unknown): unknown[][] => {
  const found: unknown[][] = [];

  const walk = (node: unknown): void => {
    if (!Array.isArray(node)) {
      return;
    }

    found.push(node);
    for (const child of node) {
      walk(child);
    }
  };

  walk(value);
  return found;
};
