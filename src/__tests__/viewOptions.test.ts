import { expect, it } from "vitest";

import { parseViewOptions, setViewOptions } from "../utils/viewOptions";

it.each([
  "",
  "?sort=invalid&keyNotation=invalid",
  "?sort=default&keyNotation=camelot",
  "?sort=TEMPO&keyNotation=STANDARD",
])("uses defaults for absent or invalid options: %s", (search) => {
  expect(parseViewOptions(search)).toEqual({ sort: "default", keyNotation: "camelot" });
});

it.each([
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
])("restores the existing sort choice %s and standard notation", (sort) => {
  expect(parseViewOptions(`?sort=${encodeURIComponent(sort)}&keyNotation=standard`)).toEqual({
    sort,
    keyNotation: "standard",
  });
});

it("removes default options and preserves unrelated repeated parameters", () => {
  const search = setViewOptions(
    "?id=seed&tag=a&tag=b&tempo=min:120&sort=tempo&keyNotation=standard",
    { sort: "default", keyNotation: "camelot" }
  );

  expect([...new URLSearchParams(search)]).toEqual([
    ["id", "seed"],
    ["tag", "a"],
    ["tag", "b"],
    ["tempo", "min:120"],
  ]);
  expect(
    setViewOptions("?sort=tempo&keyNotation=standard", { sort: "default", keyNotation: "camelot" })
  ).toBe("");
});

it("changes one option without rewriting the other", () => {
  expect(setViewOptions("?sort=tempo&keyNotation=standard", { sort: "major/minor" })).toBe(
    "?keyNotation=standard&sort=major%2Fminor"
  );
  expect(setViewOptions("?sort=tempo&keyNotation=standard", { keyNotation: "camelot" })).toBe(
    "?sort=tempo"
  );
});
