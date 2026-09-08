import { Location } from "history";

import { KeyOptionTypes, TrackSortByChoices } from "../types";

export type ViewOptions = { sort: TrackSortByChoices; keyNotation: KeyOptionTypes };

const sortChoices: TrackSortByChoices[] = [
  "default",
  "duration",
  "popularity",
  "valence",
  "tempo",
  "energy",
  "durationThenKey",
  "major/minor",
  "energyThenKey",
  "tempoThenKey",
  "valenceThenKey",
];

// Read URL view options, falling back to default sorting and Camelot notation.
export const parseViewOptions = (search: string): ViewOptions => {
  const params = new URLSearchParams(search);
  const sort = params.get("sort") as TrackSortByChoices;

  return {
    sort: sortChoices.includes(sort) ? sort : "default",
    keyNotation: params.get("keyNotation") === "standard" ? "standard" : "camelot",
  };
};

// Update supplied view options, omitting defaults and preserving unrelated parameters.
export const setViewOptions = (search: string, options: Partial<ViewOptions>): string => {
  const params = new URLSearchParams(search);
  if (options.sort !== undefined) {
    params.delete("sort");
    if (sortChoices.includes(options.sort) && options.sort !== "default") {
      params.set("sort", options.sort);
    }
  }

  if (options.keyNotation !== undefined) {
    params.delete("keyNotation");
    if (options.keyNotation === "standard") {
      params.set("keyNotation", "standard");
    }
  }
  const query = params.toString();

  return query ? `?${query}` : "";
};

// Compare the rest of the destination semantically, so URLSearchParams encoding changes
// (such as spaces or colons) don't discard a draft when a selector writes the URL.
export const changesOnlyViewOptions = (previous: Location, next: Location): boolean => {
  const withoutOptions = (search: string) => {
    const params = new URLSearchParams(search);
    params.delete("sort");
    params.delete("keyNotation");
    params.sort();
    return params.toString();
  };

  return (
    previous.pathname === next.pathname &&
    previous.hash === next.hash &&
    previous.state === next.state &&
    previous.search !== next.search &&
    withoutOptions(previous.search) === withoutOptions(next.search)
  );
};
